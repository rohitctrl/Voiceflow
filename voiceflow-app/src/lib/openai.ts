import OpenAI from 'openai'

export const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function transcribeAudio(audioFile: File): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
      temperature: 0.0,
    })

    return transcription
  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error('Failed to transcribe audio')
  }
}

export async function transcribeAudioDetailed(audioFile: File) {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
      temperature: 0.0,
    })

    return {
      text: transcription.text,
      duration: transcription.duration,
      words: transcription.words,
      language: transcription.language,
    }
  } catch (error) {
    console.error('Detailed transcription error:', error)
    throw new Error('Failed to transcribe audio with details')
  }
}