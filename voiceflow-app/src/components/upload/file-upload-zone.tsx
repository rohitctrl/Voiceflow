'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Upload, X, File, AlertCircle, RotateCcw } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  onUploadComplete?: (files: File[]) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  maxSize?: number
  className?: string
}

export function FileUploadZone({ 
  onFilesSelected, 
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxSize = 25 * 1024 * 1024,
  className 
}: FileUploadZoneProps) {
  const {
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
  } = useFileUpload({
    maxFiles,
    maxSize,
    onFilesAccepted: onFilesSelected,
    onUploadComplete,
    onUploadError,
  })

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card 
        {...getRootProps()} 
        className={`
          cursor-pointer transition-all duration-200 border-2 border-dashed
          ${isDragActive ? 'border-primary bg-primary/5 scale-105' : 'border-border'}
          ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
          hover:border-primary hover:bg-primary/5
        `}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          
          <motion.div
            animate={{
              scale: isDragActive ? 1.05 : 1,
              rotate: isDragActive ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <Upload className={`
              mx-auto h-12 w-12 mb-4
              ${isDragActive ? 'text-primary' : 'text-muted-foreground'}
              ${isDragReject ? 'text-destructive' : ''}
            `} />
          </motion.div>

          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive 
                ? isDragReject 
                  ? 'Invalid file type' 
                  : 'Drop your audio files here'
                : 'Drag & drop audio files here'
              }
            </p>
            
            <p className="text-sm text-muted-foreground">
              or click to browse your files
            </p>
            
            <p className="text-xs text-muted-foreground">
              Supports MP3, WAV, M4A, WebM, OPUS, OGG up to {formatFileSize(maxSize)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Selected Files ({uploadedFiles.length}/{maxFiles})
              </h3>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFiles}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedFiles.map((uploadedFile) => (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                >
                  <File className="h-4 w-4 text-primary flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      {uploadedFile.retries && uploadedFile.retries > 0 && (
                        <p className="text-xs text-orange-500">
                          Retry {uploadedFile.retries}/3
                        </p>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {isUploading && !uploadedFile.error && (
                      <div className="mt-1 w-full bg-muted rounded-full h-1">
                        <motion.div
                          className="bg-primary h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadedFile.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {uploadedFile.error && (
                      <p className="text-xs text-destructive mt-1">
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>

                  {uploadedFile.error && (
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryFile(uploadedFile.id)}
                        disabled={isUploading}
                        title="Retry upload"
                        className="p-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    disabled={isUploading}
                    className="flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Upload Button */}
            <Button 
              onClick={uploadFiles}
              disabled={isUploading || uploadedFiles.length === 0}
              className="w-full"
              size="lg"
            >
              {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'}`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}