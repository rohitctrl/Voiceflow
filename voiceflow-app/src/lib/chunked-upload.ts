export interface ChunkUploadOptions {
  chunkSize?: number
  maxRetries?: number
  onProgress?: (progress: number) => void
}

export interface ChunkUploadResult {
  success: boolean
  data?: any
  error?: string
}

export async function uploadFileInChunks(
  file: File,
  uploadUrl: string,
  options: ChunkUploadOptions = {}
): Promise<ChunkUploadResult> {
  const {
    chunkSize = 1024 * 1024, // 1MB chunks
    maxRetries = 3,
    onProgress
  } = options

  // If file is small enough, upload directly
  if (file.size <= chunkSize * 2) {
    const formData = new FormData()
    formData.append('audio', file)
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }
      
      onProgress?.(100)
      return { success: true, data: await response.json() }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    }
  }

  // For larger files, use chunked upload
  const totalChunks = Math.ceil(file.size / chunkSize)
  const uploadId = Date.now().toString()
  
  try {
    const chunks: Blob[] = []
    
    // Split file into chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      chunks.push(file.slice(start, end))
    }
    
    // Upload chunks in parallel with controlled concurrency
    const CONCURRENT_CHUNKS = 3
    const uploadedChunks: Array<{ index: number; success: boolean }> = []
    
    for (let i = 0; i < chunks.length; i += CONCURRENT_CHUNKS) {
      const batch = chunks.slice(i, i + CONCURRENT_CHUNKS)
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex
        let retries = 0
        
        while (retries < maxRetries) {
          try {
            const formData = new FormData()
            formData.append('chunk', chunk)
            formData.append('chunkIndex', chunkIndex.toString())
            formData.append('totalChunks', totalChunks.toString())
            formData.append('uploadId', uploadId)
            formData.append('fileName', file.name)
            
            const response = await fetch(`${uploadUrl}/chunk`, {
              method: 'POST',
              body: formData,
              headers: {
                'Accept-Encoding': 'gzip, deflate, br',
              },
            })
            
            if (response.ok) {
              return { index: chunkIndex, success: true }
            }
            throw new Error(`Chunk ${chunkIndex} failed: ${response.statusText}`)
          } catch (error) {
            retries++
            if (retries === maxRetries) {
              throw error
            }
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
          }
        }
        
        return { index: chunkIndex, success: false }
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      batchResults.forEach((result, batchIndex) => {
        const chunkIndex = i + batchIndex
        if (result.status === 'fulfilled') {
          uploadedChunks.push(result.value)
        } else {
          uploadedChunks.push({ index: chunkIndex, success: false })
        }
      })
      
      // Update progress
      const progress = Math.round((uploadedChunks.length / totalChunks) * 100)
      onProgress?.(progress)
    }
    
    // Check if all chunks were uploaded successfully
    const failedChunks = uploadedChunks.filter(chunk => !chunk.success)
    if (failedChunks.length > 0) {
      throw new Error(`Failed to upload ${failedChunks.length} chunks`)
    }
    
    // Finalize upload
    const finalizeResponse = await fetch(`${uploadUrl}/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      body: JSON.stringify({
        uploadId,
        totalChunks,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }),
    })
    
    if (!finalizeResponse.ok) {
      throw new Error(`Failed to finalize upload: ${finalizeResponse.statusText}`)
    }
    
    const result = await finalizeResponse.json()
    return { success: true, data: result }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Chunked upload failed' 
    }
  }
}