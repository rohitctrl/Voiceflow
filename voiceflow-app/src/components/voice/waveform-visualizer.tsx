'use client'

import { motion } from 'framer-motion'
import { WaveformData } from '@/types'

interface WaveformVisualizerProps {
  waveformData: WaveformData
  isRecording: boolean
  className?: string
}

export function WaveformVisualizer({ waveformData, isRecording, className }: WaveformVisualizerProps) {
  const { peaks } = waveformData
  const barCount = 40
  
  // Generate bars with animation
  const bars = Array.from({ length: barCount }, (_, index) => {
    const peak = peaks[index % peaks.length] || 0
    const height = isRecording ? Math.max(peak * 100, 5) : 5
    
    return (
      <motion.div
        key={index}
        className="waveform-bar"
        style={{
          height: `${height}%`,
          minHeight: '4px',
        }}
        animate={{
          height: `${height}%`,
          opacity: isRecording ? 1 : 0.3,
        }}
        transition={{
          duration: 0.1,
          ease: 'easeOut',
        }}
      />
    )
  })

  return (
    <div className={`flex items-end justify-center space-x-1 h-20 ${className}`}>
      {bars}
    </div>
  )
}