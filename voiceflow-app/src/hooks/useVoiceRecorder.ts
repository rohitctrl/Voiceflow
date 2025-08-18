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
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser')
      }

      // Request audio with enhanced settings for better recording quality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        } 
      })
      streamRef.current = stream

      // Initialize Web Audio API for waveform visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume audio context if it's suspended (required in some browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8
      source.connect(analyserRef.current)

      return stream
    } catch (error) {
      console.error('Error accessing microphone:', error)
      let errorMessage = 'Failed to access microphone'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access denied. Please allow microphone permission and try again.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is busy or not available. Please try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      throw new Error(errorMessage)
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
      
      // Determine the best audio format to use (prefer OPUS for best quality/compression)
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav'
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 // 128kbps for good quality
      })
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setRecordingState(prev => ({
          ...prev,
          audioBlob,
          isRecording: false,
          isPaused: false,
        }))
        
        // Clean up streams and contexts
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
        }))
      }

      // Start recording with small time slices for better responsiveness
      mediaRecorderRef.current.start(100)
      startTimeRef.current = Date.now()
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
      }))

      // Start duration timer and waveform updates
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