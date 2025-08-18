import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { audioProcessingQueue } from '@/lib/queue'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const job = await audioProcessingQueue.getJob(jobId)
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      jobId,
      progress: job.progress || 0,
      stage: job.stage || 'waiting',
      status: job.status || 'waiting',
      error: job.error?.message || null,
      recordingId: job.data.recordingId
    })

  } catch (error) {
    console.error('Progress tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to get job progress' },
      { status: 500 }
    )
  }
}
