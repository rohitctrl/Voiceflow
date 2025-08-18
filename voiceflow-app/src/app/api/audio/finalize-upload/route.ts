import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readdir, readFile, writeFile, unlink, rmdir } from 'fs/promises'
import { join } from 'path'
import { audioProcessingQueue } from '@/lib/queue'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { uploadId, fileName, mimeType } = await request.json()

    if (!uploadId || !fileName || !mimeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'temp', 'uploads', uploadId)
    const finalDir = join(process.cwd(), 'uploads')
    await mkdir(finalDir, { recursive: true })

    // Read all chunks and combine them
    const chunkFiles = await readdir(uploadDir)
    const sortedChunks = chunkFiles
      .filter(file => file.startsWith('chunk_'))
      .sort()

    const finalPath = join(finalDir, `${uploadId}_${fileName}`)
    const writeStream = require('fs').createWriteStream(finalPath)

    try {
      for (const chunkFile of sortedChunks) {
        const chunkPath = join(uploadDir, chunkFile)
        const chunkData = await readFile(chunkPath)
        writeStream.write(chunkData)
        
        // Clean up chunk file
        await unlink(chunkPath)
      }
    } finally {
      writeStream.end()
    }

    // Clean up upload directory
    try {
      await rmdir(uploadDir)
    } catch (error) {
      console.warn('Could not remove upload directory:', error)
    }

    // Get file size
    const finalFileData = await readFile(finalPath)
    const fileSize = finalFileData.length

    // Create recording record
    const recording = await prisma.recording.create({
      data: {
        title: fileName,
        fileName: fileName,
        filePath: finalPath,
        fileSize: fileSize,
        mimeType: mimeType,
        processed: false,
        userId: session.user.id,
      }
    })

    // Add to processing queue
    const job = await audioProcessingQueue.add('process-audio', {
      recordingId: recording.id,
      audioFile: {
        buffer: finalFileData,
        originalName: fileName,
        mimeType: mimeType
      },
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      jobId: job.id,
      fileName: fileName,
      fileSize: fileSize,
      message: 'Upload completed and processing started'
    })

  } catch (error) {
    console.error('Finalize upload error:', error)
    return NextResponse.json(
      { error: 'Failed to finalize upload' },
      { status: 500 }
    )
  }
}

// Helper function to create directory if it doesn't exist
async function mkdir(path: string, options: { recursive: boolean }) {
  const fs = require('fs').promises
  try {
    await fs.mkdir(path, options)
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }
}
