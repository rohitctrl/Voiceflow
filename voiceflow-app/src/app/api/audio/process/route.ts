import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { audioProcessingQueue } from '@/lib/queue'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const title = formData.get('title') as string

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Create recording record
    const recording = await prisma.recording.create({
      data: {
        title: title || audioFile.name,
        fileName: audioFile.name,
        filePath: '', // Will be set later
        fileSize: audioFile.size,
        mimeType: audioFile.type,
        processed: false,
        userId: session.user.id,
      }
    })

    // Convert file to buffer for queue processing
    const buffer = Buffer.from(await audioFile.arrayBuffer())

    // Add job to queue
    const job = await audioProcessingQueue.add('process-audio', {
      recordingId: recording.id,
      audioFile: {
        buffer,
        originalName: audioFile.name,
        mimeType: audioFile.type
      },
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      jobId: job.id,
      message: 'Audio processing started in background'
    })

  } catch (error) {
    console.error('Audio processing error:', error)
    return NextResponse.json(
      { error: 'Failed to start audio processing' },
      { status: 500 }
    )
  }
}
