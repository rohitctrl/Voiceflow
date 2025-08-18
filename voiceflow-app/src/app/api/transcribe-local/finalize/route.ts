import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { uploadId, totalChunks, fileName, fileSize, mimeType } = await request.json()

    if (!uploadId || !totalChunks || !fileName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm', 'audio/opus', 'audio/ogg']
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const tempDir = path.join(os.tmpdir(), 'voiceflow-chunks', uploadId)
    
    // Check if all chunks exist
    const chunkPaths: string[] = []
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk_${i}`)
      try {
        await fs.access(chunkPath)
        chunkPaths.push(chunkPath)
      } catch {
        return NextResponse.json({ 
          error: `Missing chunk ${i}. Please retry upload.` 
        }, { status: 400 })
      }
    }

    // Combine chunks into a single file
    const combinedFilePath = path.join(tempDir, fileName)
    const writeStream = await fs.open(combinedFilePath, 'w')
    
    try {
      for (const chunkPath of chunkPaths) {
        const chunkData = await fs.readFile(chunkPath)
        await writeStream.write(chunkData)
      }
    } finally {
      await writeStream.close()
    }

    // Read the combined file and create a File-like object
    const fileBuffer = await fs.readFile(combinedFilePath)
    const file = new File([new Uint8Array(fileBuffer)], fileName, { type: mimeType })

    // Forward to local Whisper service
    const whisperFormData = new FormData()
    whisperFormData.append('audio', file)

    // Create optimized request with timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Whisper service timeout')), 60000) // 1 minute timeout
    })
    
    const whisperPromise = fetch('http://localhost:8001/', {
      method: 'POST',
      body: whisperFormData,
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=55, max=1000',
      },
      signal: AbortSignal.timeout(55000) // 55 second timeout
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

    // Clean up temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError)
    }

    // Return compressed response
    const response = NextResponse.json({
      transcript: whisperResult.transcript,
      duration: whisperResult.duration,
      language: whisperResult.language || 'en',
      wordCount: whisperResult.word_count || whisperResult.transcript.split(' ').length,
      model: 'whisper-base-local'
    })
    
    response.headers.set('Content-Encoding', 'gzip')
    response.headers.set('Cache-Control', 'no-store')
    
    return response

  } catch (error) {
    console.error('Finalize upload error:', error)
    
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
        error: 'Failed to finalize upload and transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}