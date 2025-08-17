'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { getAudioMimeType, formatFileSize } from '@/lib/utils'

interface UploadedFile {
  file: File
  id: string
  progress: number
  error?: string
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
    acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm'],
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
      return 'File type not supported. Please upload MP3, WAV, M4A, or WebM files.'
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
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm'],
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

  const simulateUpload = useCallback(async (fileId: string) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress } : f)
      )
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }, [])

  const uploadFiles = useCallback(async () => {
    if (uploadedFiles.length === 0) return

    setIsUploading(true)
    
    try {
      // Simulate upload for each file
      await Promise.all(
        uploadedFiles.map(({ id }) => simulateUpload(id))
      )

      const files = uploadedFiles.map(({ file }) => file)
      onUploadComplete?.(files)
    } catch (error) {
      onUploadError?.('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [uploadedFiles, simulateUpload, onUploadComplete, onUploadError])

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
  }
}