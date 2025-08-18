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

    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const uploadId = formData.get('uploadId') as string
    const fileName = formData.get('fileName') as string

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId || !fileName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Create temporary directory for chunks
    const tempDir = path.join(os.tmpdir(), 'voiceflow-chunks', uploadId)
    await fs.mkdir(tempDir, { recursive: true })

    // Save chunk to temporary file
    const chunkPath = path.join(tempDir, `chunk_${chunkIndex}`)
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    await fs.writeFile(chunkPath, chunkBuffer)

    return NextResponse.json({ 
      success: true, 
      chunkIndex,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`
    })

  } catch (error) {
    console.error('Chunk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload chunk' },
      { status: 500 }
    )
  }
}