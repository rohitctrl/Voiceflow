'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { getAudioMimeType, formatFileSize } from '@/lib/utils'
import { UploadService } from '@/lib/service-worker'

interface UploadedFile {
  file: File
  id: string
  progress: number
  error?: string
  retries?: number
}

interface UseFileUploadOptions {
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  onFilesAccepted?: (files: File[]) => void
  onUploadComplete?: (files: File[]) => void
  onUploadError?: (error: string) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxFiles = 5,
    maxSize = 25 * 1024 * 1024, // 25MB
    acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm', 'audio/opus', 'audio/ogg'],
    onFilesAccepted,
    onUploadComplete,
    onUploadError,
  } = options

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`
    }

    // Check file type
    const mimeType = getAudioMimeType(file)
    if (!acceptedTypes.includes(mimeType)) {
      return 'File type not supported. Please upload MP3, WAV, M4A, WebM, OPUS, or OGG files.'
    }

    return null
  }, [maxSize, acceptedTypes])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      ).join('\n')
      onUploadError?.(errors)
      return
    }

    // Validate accepted files
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of acceptedFiles) {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    }

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      // Check total file count
      if (uploadedFiles.length + validFiles.length > maxFiles) {
        onUploadError?.(`Cannot upload more than ${maxFiles} files`)
        return
      }

      // Add files to upload queue
      const newFiles: UploadedFile[] = validFiles.map(file => ({
        file,
        id: Math.random().toString(36).substring(2),
        progress: 0,
      }))

      setUploadedFiles(prev => [...prev, ...newFiles])
      onFilesAccepted?.(validFiles)
    }
  }, [uploadedFiles.length, maxFiles, validateFile, onFilesAccepted, onUploadError])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.opus', '.ogg'],
    },
    maxSize,
    maxFiles,
    multiple: true,
  })

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])
  

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([])
  }, [])

  const processFileForUpload = useCallback(async (uploadedFile: UploadedFile): Promise<File | null> => {
    try {
      // Update progress to 10%
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { ...f, progress: 10 } : f)
      )
      
      // Use optimized upload service
      const uploadService = UploadService.getInstance()
      
      const transcriptionData = await uploadService.uploadFile(
        uploadedFile.file,
        (progress) => {
          // Map upload progress to 10-40%
          const adjustedProgress = 10 + (progress * 0.3)
          setUploadedFiles(prev => 
            prev.map(f => f.id === uploadedFile.id ? { ...f, progress: adjustedProgress } : f)
          )
        }
      )

      // Update progress to 50%
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { ...f, progress: 50 } : f)
      )

      // Process the transcript with local Ollama in parallel with saving
      const [processResponse, saveResponse] = await Promise.all([
        fetch('/api/process-text-local', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
          },
          body: JSON.stringify({ transcript: transcriptionData.transcript }),
        }),
        // Start preparing data for database save
        Promise.resolve({
          fileName: uploadedFile.file.name,
          fileSize: uploadedFile.file.size,
          duration: transcriptionData.duration || 0,
          mimeType: uploadedFile.file.type,
          transcript: transcriptionData.transcript,
        })
      ])

      if (!processResponse.ok) {
        throw new Error('Failed to process transcript')
      }

      const processedData = await processResponse.json()
      const saveData = saveResponse

      // Update progress to 80%
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { ...f, progress: 80 } : f)
      )

      // Save the recording to database
      const finalSaveResponse = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        body: JSON.stringify({
          title: processedData.title,
          fileName: saveData.fileName,
          filePath: `/uploads/${saveData.fileName}`,
          fileSize: saveData.fileSize,
          duration: saveData.duration,
          mimeType: saveData.mimeType,
          transcript: processedData.cleanedText,
          summary: processedData.summary,
          tags: processedData.tags,
        }),
      })

      if (!finalSaveResponse.ok) {
        throw new Error('Failed to save recording')
      }

      // Update progress to 100%
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { ...f, progress: 100 } : f)
      )

      return uploadedFile.file
      
    } catch (fileError) {
      console.error(`Error processing file ${uploadedFile.file.name}:`, fileError)
      
      let userFriendlyError = 'Processing failed'
      if (fileError instanceof Error) {
        const errorMsg = fileError.message.toLowerCase()
        if (errorMsg.includes('timeout')) {
          userFriendlyError = 'Upload timed out - service may be slow'
        } else if (errorMsg.includes('unavailable') || errorMsg.includes('503')) {
          userFriendlyError = 'Service unavailable - check Whisper service'
        } else if (errorMsg.includes('network')) {
          userFriendlyError = 'Network error - check connection'
        } else {
          userFriendlyError = fileError.message
        }
      }
      
      // Mark this file as error
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { 
          ...f, 
          progress: 0, 
          error: userFriendlyError
        } : f)
      )
      return null
    }
  }, [])

  const retryFile = useCallback(async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (!file || !file.error) return
    
    const maxRetries = 3
    const currentRetries = file.retries || 0
    
    if (currentRetries >= maxRetries) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          error: `Max retries (${maxRetries}) exceeded. Please check the service and try again.`
        } : f)
      )
      return
    }
    
    // Clear error and increment retry count
    setUploadedFiles(prev => 
      prev.map(f => f.id === fileId ? { 
        ...f, 
        error: undefined,
        progress: 0,
        retries: currentRetries + 1
      } : f)
    )
    
    // Retry the upload
    const result = await processFileForUpload(file)
    if (!result) {
    }
  }, [uploadedFiles, processFileForUpload])

  const uploadFiles = useCallback(async () => {
    if (uploadedFiles.length === 0) return

    setIsUploading(true)
    
    try {
      // Process files in parallel with a concurrency limit of 3
      const CONCURRENCY_LIMIT = 3
      const processedFiles: File[] = []
      
      for (let i = 0; i < uploadedFiles.length; i += CONCURRENCY_LIMIT) {
        const batch = uploadedFiles.slice(i, i + CONCURRENCY_LIMIT)
        const batchResults = await Promise.allSettled(
          batch.map(uploadedFile => processFileForUpload(uploadedFile))
        )
        
        // Collect successful results
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            processedFiles.push(result.value)
          }
        })
      }

      // Call completion callback with successfully processed files
      if (processedFiles.length > 0) {
        onUploadComplete?.(processedFiles)
      }
      
      if (processedFiles.length < uploadedFiles.length) {
        const failedCount = uploadedFiles.length - processedFiles.length
        onUploadError?.(`${failedCount} file(s) failed to process. Check individual file errors.`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [uploadedFiles, processFileForUpload, onUploadComplete, onUploadError])

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    uploadedFiles,
    isUploading,
    removeFile,
    clearAllFiles,
    uploadFiles,
    retryFile,
  }
}