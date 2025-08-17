'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { RecordingState, WaveformData } from '@/types'

export function useVoiceRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
  })
  const [waveformData, setWaveformData] = useState<WaveformData>({
    peaks: [],
    duration: 0,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const startTimeRef = useRef<number>(0)

  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      return stream
    } catch (error) {
      console.error('Error accessing microphone:', error)
      throw error
    }
  }, [])

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    const peaks = Array.from(dataArray).map(value => value / 255)
    setWaveformData(prev => ({
      ...prev,
      peaks: peaks.slice(0, 50), // Limit to 50 bars for visualization
    }))
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await initializeAudioContext()
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordingState(prev => ({
          ...prev,
          audioBlob,
          isRecording: false,
          isPaused: false,
        }))
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }

      mediaRecorderRef.current.start()
      startTimeRef.current = Date.now()
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
      }))

      // Start duration timer
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        setRecordingState(prev => ({
          ...prev,
          duration: elapsed,
        }))
        setWaveformData(prev => ({
          ...prev,
          duration: elapsed,
        }))
        updateWaveform()
      }, 100)

    } catch (error) {
      console.error('Error starting recording:', error)
      throw error
    }
  }, [initializeAudioContext, updateWaveform])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop()
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [recordingState.isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording && !recordingState.isPaused) {
      mediaRecorderRef.current.pause()
      setRecordingState(prev => ({ ...prev, isPaused: true }))
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [recordingState.isRecording, recordingState.isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording && recordingState.isPaused) {
      mediaRecorderRef.current.resume()
      setRecordingState(prev => ({ ...prev, isPaused: false }))
      
      startTimeRef.current = Date.now() - recordingState.duration * 1000
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        setRecordingState(prev => ({
          ...prev,
          duration: elapsed,
        }))
        updateWaveform()
      }, 100)
    }
  }, [recordingState.isRecording, recordingState.isPaused, recordingState.duration, updateWaveform])

  const resetRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
    })
    
    setWaveformData({
      peaks: [],
      duration: 0,
    })
    
    audioChunksRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    recordingState,
    waveformData,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  }
}