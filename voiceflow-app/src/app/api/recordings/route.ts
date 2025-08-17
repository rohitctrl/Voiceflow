import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const recordings = await prisma.recording.findMany({
      where: {
        userId: session.user.id,
        OR: search ? [
          { title: { contains: search } },
          { transcript: { contains: search } },
          { summary: { contains: search } },
        ] : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    const total = await prisma.recording.count({
      where: {
        userId: session.user.id,
        OR: search ? [
          { title: { contains: search } },
          { transcript: { contains: search } },
          { summary: { contains: search } },
        ] : undefined,
      },
    })

    return NextResponse.json({
      recordings,
      total,
      hasMore: offset + recordings.length < total,
    })

  } catch (error) {
    console.error('Error fetching recordings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      fileName,
      filePath,
      fileSize,
      duration,
      mimeType,
      transcript,
      summary,
      tags,
    } = await request.json()

    const recording = await prisma.recording.create({
      data: {
        title,
        fileName,
        filePath,
        fileSize,
        duration,
        mimeType,
        transcript,
        summary,
        tags: JSON.stringify(tags || []),
        processed: !!transcript,
        userId: session.user.id,
      },
    })

    return NextResponse.json(recording)

  } catch (error) {
    console.error('Error creating recording:', error)
    return NextResponse.json(
      { error: 'Failed to create recording' },
      { status: 500 }
    )
  }
}