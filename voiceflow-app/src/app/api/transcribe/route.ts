import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { transcribeAudioDetailed } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    const result = await transcribeAudioDetailed(audioFile)

    return NextResponse.json({
      transcript: result.text,
      duration: result.duration,
      language: result.language,
      wordCount: result.words?.length || 0,
    })

  } catch (error) {
    console.error('Transcription API error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}