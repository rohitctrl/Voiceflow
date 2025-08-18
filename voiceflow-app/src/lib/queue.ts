import Queue from 'bull'

// In-memory queue for development (no Redis required)
interface JobData {
  recordingId: string
  audioFile: {
    buffer: Buffer
    originalName: string
    mimeType: string
  }
  userId: string
}

interface JobProgress {
  progress: number
  stage: 'uploading' | 'transcribing' | 'processing' | 'completed' | 'failed'
  message: string
}

class InMemoryQueue {
  private jobs = new Map<string, any>()
  private workers: Array<(job: any) => Promise<void>> = []
  private isProcessing = false

  async add(name: string, data: JobData): Promise<{ id: string }> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job = {
      id: jobId,
      data,
      progress: 0,
      stage: 'uploading' as const,
      status: 'waiting',
      createdAt: new Date(),
      process: (callback: (progress: JobProgress) => void) => {
        return this.processJob(job, callback)
      }
    }
    
    this.jobs.set(jobId, job)
    this.processNext()
    
    return { id: jobId }
  }

  async getJob(jobId: string) {
    return this.jobs.get(jobId)
  }

  process(processor: (job: any) => Promise<void>) {
    this.workers.push(processor)
  }

  private async processNext() {
    if (this.isProcessing || this.workers.length === 0) return
    
    const waitingJobs = Array.from(this.jobs.values()).filter(j => j.status === 'waiting')
    if (waitingJobs.length === 0) return
    
    this.isProcessing = true
    const job = waitingJobs[0]
    job.status = 'processing'
    
    try {
      for (const worker of this.workers) {
        await worker(job)
      }
      job.status = 'completed'
    } catch (error) {
      job.status = 'failed'
      job.error = error
    } finally {
      this.isProcessing = false
      // Process next job
      setTimeout(() => this.processNext(), 100)
    }
  }

  private async processJob(job: any, progressCallback: (progress: JobProgress) => void) {
    // Simulate processing stages
    const stages = [
      { progress: 10, stage: 'uploading' as const, message: 'Uploading audio file...' },
      { progress: 30, stage: 'transcribing' as const, message: 'Transcribing audio...' },
      { progress: 70, stage: 'processing' as const, message: 'Processing text...' },
      { progress: 100, stage: 'completed' as const, message: 'Processing complete!' }
    ]

    for (const stage of stages) {
      progressCallback(stage)
      job.progress = stage.progress
      job.stage = stage.stage
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work
    }
  }
}

// Create queue instance
const audioProcessingQueue = new InMemoryQueue()

// Job processor
audioProcessingQueue.process(async (job) => {
  const { recordingId, audioFile, userId } = job.data
  
  console.log(`Processing audio for recording ${recordingId}`)
  
  // Update progress
  job.progress(10, 'Preparing audio file...')
  
  // Here we would process the audio file
  // For now, we'll simulate the processing
  
  job.progress(50, 'Transcribing audio...')
  
  // Simulate transcription
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  job.progress(80, 'Processing text...')
  
  // Simulate text processing
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  job.progress(100, 'Complete!')
  
  console.log(`Completed processing for recording ${recordingId}`)
})

export { audioProcessingQueue, type JobData, type JobProgress }
