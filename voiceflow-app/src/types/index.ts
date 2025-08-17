import { Recording, User } from '@prisma/client'

export interface RecordingWithUser extends Recording {
  user: User
}

export interface TranscriptionResult {
  text: string
  confidence?: number
  duration?: number
}

export interface ProcessingResult {
  transcript: string
  summary: string
  tags: string[]
}

export interface AudioUpload {
  file: File
  title?: string
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob?: Blob
}

export interface WaveformData {
  peaks: number[]
  duration: number
}

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'processing' | 'completed' | 'error'

export interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  maxDuration?: number
  className?: string
}