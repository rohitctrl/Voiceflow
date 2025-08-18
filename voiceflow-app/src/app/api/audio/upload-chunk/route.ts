import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { uploadRateLimit } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await uploadRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const uploadId = formData.get('uploadId') as string
    const totalChunks = parseInt(formData.get('totalChunks') as string)

    if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json({ error: 'Invalid chunk data' }, { status: 400 })
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'temp', 'uploads', uploadId)
    await mkdir(uploadDir, { recursive: true })

    // Save chunk
    const chunkPath = join(uploadDir, `chunk_${chunkIndex.toString().padStart(4, '0')}`)
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    await writeFile(chunkPath, chunkBuffer)

    return NextResponse.json({
      success: true,
      chunkIndex,
      uploadId,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`
    })

  } catch (error) {
    console.error('Chunk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload chunk' },
      { status: 500 }
    )
  }
}
