'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WaveformVisualizer } from './waveform-visualizer'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { formatDuration } from '@/lib/utils'
import { Mic, Square, Pause, Play, RotateCcw } from 'lucide-react'
import { VoiceRecorderProps } from '@/types'

export function VoiceRecorder({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop,
  maxDuration = 300, // 5 minutes default
  className 
}: VoiceRecorderProps) {
  const [error, setError] = useState<string | null>(null)
  const {
    recordingState,
    waveformData,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useVoiceRecorder()

  const handleStartRecording = async () => {
    try {
      setError(null)
      await startRecording()
      onRecordingStart?.()
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Recording error:', err)
    }
  }

  const handleStopRecording = () => {
    stopRecording()
    onRecordingStop?.()
    
    if (recordingState.audioBlob) {
      onRecordingComplete(recordingState.audioBlob, recordingState.duration)
    }
  }

  const handlePauseRecording = () => {
    if (recordingState.isPaused) {
      resumeRecording()
    } else {
      pauseRecording()
    }
  }

  const isMaxDurationReached = recordingState.duration >= maxDuration

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* Waveform Visualizer */}
        <WaveformVisualizer 
          waveformData={waveformData} 
          isRecording={recordingState.isRecording && !recordingState.isPaused}
        />

        {/* Duration Display */}
        <div className="text-center">
          <div className="text-2xl font-mono font-bold">
            {formatDuration(recordingState.duration)}
          </div>
          {maxDuration && (
            <div className="text-sm text-muted-foreground">
              Max: {formatDuration(maxDuration)}
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center space-x-4">
          <AnimatePresence mode="wait">
            {!recordingState.isRecording ? (
              <motion.div
                key="start"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="xl"
                  variant="recording"
                  onClick={handleStartRecording}
                  disabled={!!error}
                  className="rounded-full w-16 h-16"
                >
                  <Mic className="h-6 w-6" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="controls"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                className="flex space-x-3"
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePauseRecording}
                  className="rounded-full w-12 h-12"
                >
                  {recordingState.isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  size="xl"
                  variant="destructive"
                  onClick={handleStopRecording}
                  className="rounded-full w-16 h-16"
                  disabled={isMaxDurationReached}
                >
                  <Square className="h-6 w-6" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetRecording}
                  className="rounded-full w-12 h-12"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-destructive bg-destructive/10 p-2 rounded"
          >
            {error}
          </motion.div>
        )}

        {recordingState.isRecording && recordingState.isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded"
          >
            Recording paused
          </motion.div>
        )}

        {isMaxDurationReached && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded"
          >
            Maximum duration reached
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}