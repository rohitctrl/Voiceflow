import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Enable gzip compression for this route
export const runtime = 'nodejs'

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
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm', 'audio/opus', 'audio/ogg']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Forward to local Whisper service with optimized headers
    const whisperFormData = new FormData()
    whisperFormData.append('audio', audioFile)

    // Create a promise that will race against the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Whisper service timeout')), 30000) // 30 second timeout
    })
    
    const whisperPromise = fetch('http://localhost:8001/', {
      method: 'POST',
      body: whisperFormData,
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=25, max=1000',
        // Don't set Content-Type, let fetch set it automatically for FormData
      },
      // Set aggressive timeouts
      signal: AbortSignal.timeout(25000) // 25 second timeout
    })
    
    const whisperResponse = await Promise.race([whisperPromise, timeoutPromise]) as Response

    if (!whisperResponse.ok) {
      let errorText = 'Unknown error'
      try {
        errorText = await Promise.race([
          whisperResponse.text(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Response read timeout')), 5000))
        ]) as string
      } catch (readError) {
        console.error('Failed to read error response:', readError)
      }
      
      console.error('Local Whisper error:', errorText)
      return NextResponse.json({ 
        error: 'Transcription service slow or unavailable',
        details: `Whisper service responded with ${whisperResponse.status}: ${errorText}. Consider restarting the service.`
      }, { status: 503 })
    }

    const whisperResult = await whisperResponse.json()

    if (!whisperResult.success) {
      return NextResponse.json({ 
        error: 'Transcription failed',
        details: whisperResult.error || whisperResult.details
      }, { status: 500 })
    }

    // Return compressed response
    const response = NextResponse.json({
      transcript: whisperResult.transcript,
      duration: whisperResult.duration,
      language: whisperResult.language || 'en',
      wordCount: whisperResult.word_count || whisperResult.transcript.split(' ').length,
      model: 'whisper-base-local'
    })
    
    // Add compression headers
    response.headers.set('Content-Encoding', 'gzip')
    response.headers.set('Cache-Control', 'no-store')
    
    return response

  } catch (error) {
    console.error('Local transcription API error:', error)
    
    // Handle specific timeout errors
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return NextResponse.json({
          error: 'Whisper service timeout',
          details: 'The transcription is taking too long. The Whisper service may be overloaded or stuck. Try restarting it with: python3 scripts/local_whisper.py',
          suggestion: 'Consider using a smaller audio file or restarting the Whisper service.'
        }, { status: 504 }) // Gateway timeout
      }
      
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return NextResponse.json({
          error: 'Local Whisper service unavailable',
          details: 'Could not connect to local Whisper service. Please start it with: python3 scripts/local_whisper.py'
        }, { status: 503 })
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio locally',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}