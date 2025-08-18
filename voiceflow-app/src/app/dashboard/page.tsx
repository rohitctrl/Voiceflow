'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RecordingWithUser } from '@/types'
import { Mic, Upload, FileAudio, Sparkles } from 'lucide-react'
import { 
  VoiceRecorderSkeleton, 
  FileUploadSkeleton, 
  RecordingsListSkeleton 
} from '@/components/ui/skeletons'

// Lazy load heavy components
const VoiceRecorder = dynamic(() => import('@/components/voice/voice-recorder').then(mod => ({ default: mod.VoiceRecorder })), {
  loading: () => <VoiceRecorderSkeleton />,
  ssr: false // Disable SSR for audio components
})

const FileUploadZone = dynamic(() => import('@/components/upload/file-upload-zone').then(mod => ({ default: mod.FileUploadZone })), {
  loading: () => <FileUploadSkeleton />
})

const RecordingsList = dynamic(() => import('@/components/dashboard/recordings-list').then(mod => ({ default: mod.RecordingsList })), {
  loading: () => <RecordingsListSkeleton />
})

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'library'>('record')
  const [selectedRecording, setSelectedRecording] = useState<RecordingWithUser | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    setIsProcessing(true)
    
    try {
      // Convert blob to file for upload
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: 'audio/webm'
      })

      // First, transcribe the audio
      const transcribeFormData = new FormData()
      transcribeFormData.append('audio', audioFile)

      const transcribeResponse = await fetch('/api/transcribe-local', {
        method: 'POST',
        body: transcribeFormData,
      })

      if (!transcribeResponse.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const transcriptionData = await transcribeResponse.json()

      // Then, process the transcript with local Ollama
      const processResponse = await fetch('/api/process-text-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptionData.transcript }),
      })

      if (!processResponse.ok) {
        throw new Error('Failed to process transcript')
      }

      const processedData = await processResponse.json()

      // Finally, save the recording to database
      const saveResponse = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: processedData.title,
          fileName: audioFile.name,
          filePath: `/uploads/${audioFile.name}`, // This would be actual file path in production
          fileSize: audioFile.size,
          duration,
          mimeType: audioFile.type,
          transcript: processedData.cleanedText,
          summary: processedData.summary,
          tags: processedData.tags,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save recording')
      }

      // Switch to library tab to show the new recording
      setActiveTab('library')
      
    } catch (error) {
      console.error('Error processing recording:', error)
      alert('Failed to process recording. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true)
  }

  const handleUploadComplete = (files: File[]) => {
    setIsProcessing(false)
    setActiveTab('library')
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    setIsProcessing(false)
    alert(`Upload error: ${error}`)
  }

  const tabs = [
    { id: 'record' as const, label: 'Record', icon: Mic },
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'library' as const, label: 'Library', icon: FileAudio },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            VoiceFlow
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            From thought to text in seconds
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-6 py-2"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-md -z-10"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Button>
              )
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {activeTab === 'record' && (
            <div className="text-center space-y-6">
              <Suspense fallback={<VoiceRecorderSkeleton />}>
                <VoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  className="mx-auto"
                />
              </Suspense>
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center space-x-2 text-primary"
                >
                  <Sparkles className="h-5 w-5 animate-spin" />
                  <span>Processing your recording with AI...</span>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <Suspense fallback={<FileUploadSkeleton />}>
                <FileUploadZone
                  onFilesSelected={handleFilesSelected}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              </Suspense>
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center space-x-2 text-primary mt-6"
                >
                  <Sparkles className="h-5 w-5 animate-spin" />
                  <span>Processing uploaded files with AI...</span>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6">
              <Suspense fallback={<RecordingsListSkeleton />}>
                <RecordingsList onRecordingSelect={setSelectedRecording} />
              </Suspense>
            </div>
          )}
        </motion.div>

        {/* Selected Recording Detail Modal */}
        {selectedRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRecording(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                {selectedRecording.title || 'Untitled Recording'}
              </h2>
              
              {selectedRecording.summary && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecording.summary}
                  </p>
                </div>
              )}
              
              {selectedRecording.transcript && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Transcript</h3>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    {selectedRecording.transcript}
                  </div>
                </div>
              )}

              <Button onClick={() => setSelectedRecording(null)}>
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}