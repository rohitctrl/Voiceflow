export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update prompt
                  showUpdatePrompt(registration);
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

function showUpdatePrompt(registration: ServiceWorkerRegistration) {
  // You can implement a custom update prompt here
  if (confirm('New version available! Reload to update?')) {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

export async function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

export async function subscribeToPushNotifications() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
  return null;
}

export function isPWAInstalled(): boolean {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
  return false;
}

export function showInstallPrompt() {
  if (typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window) {
    const event = new Event('beforeinstallprompt');
    window.dispatchEvent(event);
  }
}

// Optimized upload service
export class UploadService {
  private static instance: UploadService;
  private uploadQueue: Array<{ file: File; resolve: Function; reject: Function }> = [];
  private isProcessing = false;
  private maxConcurrentUploads = 3;
  private currentUploads = 0;

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      this.uploadQueue.push({ file, resolve, reject });
      this.processQueue(onProgress);
    });
  }

  private async processQueue(onProgress?: (progress: number) => void) {
    if (this.isProcessing || this.currentUploads >= this.maxConcurrentUploads || this.uploadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.currentUploads++;

    const { file, resolve, reject } = this.uploadQueue.shift()!;

    try {
      const result = await this.performUpload(file, onProgress);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.currentUploads--;
      this.isProcessing = false;
      // Process next item in queue
      if (this.uploadQueue.length > 0) {
        this.processQueue(onProgress);
      }
    }
  }

  private async performUpload(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

    // For small files, use direct upload
    if (file.size <= CHUNK_SIZE * 2) {
      return this.directUpload(file, onProgress);
    }

    // For large files, use chunked upload
    return this.chunkedUpload(file, onProgress);
  }

  private async directUpload(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('audio', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        } else if (xhr.status === 504) {
          reject(new Error('Transcription service timeout - please try again with a smaller file or restart the Whisper service'));
        } else if (xhr.status === 503) {
          reject(new Error('Transcription service unavailable - please check if the Whisper service is running'));
        } else {
          let errorMessage = `Upload failed: ${xhr.statusText}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.details || errorResponse.error || errorMessage;
          } catch (e) {
            // Ignore JSON parse error, use default message
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload - please check your connection'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout - the service may be overloaded. Try again later or restart the Whisper service.'));
      });

      xhr.open('POST', '/api/transcribe-local');
      xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
      xhr.timeout = 35000; // 35 second timeout (shorter than API timeout)
      xhr.send(formData);
    });
  }

  private async chunkedUpload(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = Date.now().toString();

    // Upload chunks in parallel
    const chunkPromises = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      chunkPromises.push(this.uploadChunk(chunk, i, totalChunks, uploadId, file.name));
    }

    // Wait for all chunks to complete
    await Promise.all(chunkPromises);
    
    // Update progress as chunks complete
    let completedChunks = 0;
    const updateProgress = () => {
      completedChunks++;
      const progress = (completedChunks / totalChunks) * 90; // Leave 10% for finalization
      onProgress?.(progress);
    };

    await Promise.all(chunkPromises.map(promise => promise.then(updateProgress)));

    // Finalize upload
    const result = await this.finalizeUpload(uploadId, totalChunks, file.name, file.size, file.type);
    onProgress?.(100);
    
    return result;
  }

  private async uploadChunk(chunk: Blob, index: number, totalChunks: number, uploadId: string, fileName: string): Promise<void> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', index.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('fileName', fileName);

    const response = await fetch('/api/transcribe-local/chunk', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk ${index}: ${response.statusText}`);
    }
  }

  private async finalizeUpload(uploadId: string, totalChunks: number, fileName: string, fileSize: number, mimeType: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000); // 65 second timeout
    
    try {
      const response = await fetch('/api/transcribe-local/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        body: JSON.stringify({
          uploadId,
          totalChunks,
          fileName,
          fileSize,
          mimeType,
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorMessage = `Failed to finalize upload: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
          
          if (response.status === 504) {
            errorMessage += ' - Consider using a smaller file or restarting the Whisper service.';
          }
        } catch (e) {
          // Ignore JSON parse error
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Upload finalization timeout - the transcription service may be overloaded.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
