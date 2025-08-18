export interface ChunkUploadOptions {
  chunkSize?: number
  maxRetries?: number
  onProgress?: (progress: number) => void
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
}

export interface UploadState {
  uploadId: string
  chunks: Chunk[]
  totalChunks: number
  completedChunks: number
  failed: boolean
  error?: string
}

interface Chunk {
  index: number
  data: Blob
  uploaded: boolean
  retries: number
}

export class ChunkedUploader {
  private static instance: ChunkedUploader
  private uploads = new Map<string, UploadState>()

  static getInstance(): ChunkedUploader {
    if (!ChunkedUploader.instance) {
      ChunkedUploader.instance = new ChunkedUploader()
    }
    return ChunkedUploader.instance
  }

  async uploadFile(
    file: File,
    options: ChunkUploadOptions = {}
  ): Promise<{ uploadId: string; success: boolean }> {
    const {
      chunkSize = 1024 * 1024, // 1MB chunks
      maxRetries = 3,
      onProgress,
      onChunkComplete
    } = options

    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const chunks = this.createChunks(file, chunkSize)
    
    const uploadState: UploadState = {
      uploadId,
      chunks,
      totalChunks: chunks.length,
      completedChunks: 0,
      failed: false
    }

    this.uploads.set(uploadId, uploadState)

    try {
      // Upload chunks with concurrency control
      const concurrency = 3
      for (let i = 0; i < chunks.length; i += concurrency) {
        const batch = chunks.slice(i, i + concurrency)
        
        await Promise.all(
          batch.map(chunk => this.uploadChunk(uploadId, chunk, maxRetries, onChunkComplete))
        )

        // Update progress
        const completed = chunks.filter(c => c.uploaded).length
        uploadState.completedChunks = completed
        onProgress?.(Math.round((completed / chunks.length) * 100))
      }

      // Finalize upload
      await this.finalizeUpload(uploadId, file.name, file.type)
      
      return { uploadId, success: true }

    } catch (error) {
      uploadState.failed = true
      uploadState.error = error instanceof Error ? error.message : 'Upload failed'
      throw error
    }
  }

  private createChunks(file: File, chunkSize: number): Chunk[] {
    const chunks: Chunk[] = []
    let start = 0
    let index = 0

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      chunks.push({
        index,
        data: chunk,
        uploaded: false,
        retries: 0
      })

      start = end
      index++
    }

    return chunks
  }

  private async uploadChunk(
    uploadId: string,
    chunk: Chunk,
    maxRetries: number,
    onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  ): Promise<void> {
    const uploadState = this.uploads.get(uploadId)
    if (!uploadState) throw new Error('Upload not found')

    while (chunk.retries < maxRetries) {
      try {
        const formData = new FormData()
        formData.append('chunk', chunk.data)
        formData.append('chunkIndex', chunk.index.toString())
        formData.append('uploadId', uploadId)
        formData.append('totalChunks', uploadState.totalChunks.toString())

        const response = await fetch('/api/audio/upload-chunk', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Chunk upload failed: ${response.statusText}`)
        }

        chunk.uploaded = true
        onChunkComplete?.(chunk.index, uploadState.totalChunks)
        return

      } catch (error) {
        chunk.retries++
        if (chunk.retries >= maxRetries) {
          throw new Error(`Chunk ${chunk.index} failed after ${maxRetries} retries`)
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, chunk.retries) * 1000)
        )
      }
    }
  }

  private async finalizeUpload(uploadId: string, fileName: string, mimeType: string): Promise<void> {
    const response = await fetch('/api/audio/finalize-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, fileName, mimeType })
    })

    if (!response.ok) {
      throw new Error('Failed to finalize upload')
    }
  }

  getUploadState(uploadId: string): UploadState | undefined {
    return this.uploads.get(uploadId)
  }

  removeUpload(uploadId: string): void {
    this.uploads.delete(uploadId)
  }
}
