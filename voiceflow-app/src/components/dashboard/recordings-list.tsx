'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RecordingWithUser } from '@/types'
import { formatDuration, formatFileSize } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  Search, 
  Download, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  MoreHorizontal,
  FileAudio 
} from 'lucide-react'

interface RecordingsListProps {
  onRecordingSelect?: (recording: RecordingWithUser) => void
}

export function RecordingsList({ onRecordingSelect }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<RecordingWithUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecordings()
  }, [searchQuery])

  const fetchRecordings = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      
      const response = await fetch(`/api/recordings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecordings(data.recordings)
      }
    } catch (error) {
      console.error('Error fetching recordings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPause = (recordingId: string) => {
    if (playingId === recordingId) {
      setPlayingId(null)
    } else {
      setPlayingId(recordingId)
    }
  }

  const handleDelete = async (recordingId: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return

    try {
      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setRecordings(prev => prev.filter(r => r.id !== recordingId))
      }
    } catch (error) {
      console.error('Error deleting recording:', error)
    }
  }

  const handleExport = (recording: RecordingWithUser) => {
    const content = `# ${recording.title || 'Voice Note'}

**Created:** ${format(new Date(recording.createdAt), 'PPpp')}
**Duration:** ${recording.duration ? formatDuration(recording.duration) : 'Unknown'}
**File:** ${recording.fileName}

## Transcript
${recording.transcript || 'No transcript available'}

## Summary
${recording.summary || 'No summary available'}

## Tags
${recording.tags ? JSON.parse(recording.tags).join(', ') : 'No tags'}
`

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recording.title || 'voice-note'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recordings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Recordings Grid */}
      <AnimatePresence>
        {recordings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recordings.map((recording) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onRecordingSelect?.(recording)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileAudio className="h-4 w-4 text-primary flex-shrink-0" />
                        <CardTitle className="text-sm truncate">
                          {recording.title || 'Untitled Recording'}
                        </CardTitle>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayPause(recording.id)
                        }}
                        className="flex-shrink-0"
                      >
                        {playingId === recording.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Duration and Size */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {recording.duration ? formatDuration(recording.duration) : '0:00'}
                      </span>
                      <span>{formatFileSize(recording.fileSize)}</span>
                    </div>

                    {/* Transcript Preview */}
                    {recording.transcript && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {recording.transcript}
                      </p>
                    )}

                    {/* Tags */}
                    {recording.tags && (
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(recording.tags).slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(recording.createdAt), 'MMM d, yyyy')}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-1 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExport(recording)
                        }}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(recording.id)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No recordings found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search terms' : 'Start by creating your first voice note'}
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}