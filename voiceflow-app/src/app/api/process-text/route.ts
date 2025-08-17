import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { processTranscript, generateTitle } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transcript } = await request.json()

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Invalid transcript provided' }, { status: 400 })
    }

    if (transcript.length < 10) {
      return NextResponse.json({ error: 'Transcript too short to process' }, { status: 400 })
    }

    // Process the transcript with Claude
    const [processedResult, generatedTitle] = await Promise.all([
      processTranscript(transcript),
      generateTitle(transcript)
    ])

    return NextResponse.json({
      title: generatedTitle,
      cleanedText: processedResult.cleanedText,
      summary: processedResult.summary,
      keyPoints: processedResult.keyPoints,
      tags: processedResult.tags,
    })

  } catch (error) {
    console.error('Text processing API error:', error)
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500 }
    )
  }
}