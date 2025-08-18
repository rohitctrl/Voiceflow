import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Process the transcript with local Ollama
    const [processedResult, generatedTitle] = await Promise.all([
      processTranscriptWithOllama(transcript),
      generateTitleWithOllama(transcript)
    ])

    return NextResponse.json({
      title: generatedTitle,
      cleanedText: processedResult.cleanedText,
      summary: processedResult.summary,
      keyPoints: processedResult.keyPoints,
      tags: processedResult.tags,
      model: 'llama3.2:1b-local'
    })

  } catch (error) {
    console.error('Local text processing API error:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        error: 'Local Ollama service unavailable',
        details: 'Could not connect to local Ollama service. Please ensure Ollama is running with: brew services start ollama'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Failed to process text locally' },
      { status: 500 }
    )
  }
}

async function processTranscriptWithOllama(transcript: string) {
  try {
    const prompt = `Analyze this voice note transcript and provide a structured response.

Original transcript:
"${transcript}"

Please provide a JSON response with the following format:
{
  "cleanedText": "Clean, well-formatted version with proper punctuation and paragraphs",
  "summary": "Concise 2-3 sentence summary",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Make sure to respond ONLY with valid JSON, no other text.`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 500
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const ollamaResult = await response.json()
    const responseText = ollamaResult.response || ''

    try {
      // Try to parse as JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          cleanedText: parsed.cleanedText || transcript,
          summary: parsed.summary || 'Summary unavailable',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse Ollama JSON response, using fallback')
    }

    // Fallback if JSON parsing fails
    return {
      cleanedText: transcript,
      summary: responseText.slice(0, 200) || 'Summary unavailable',
      keyPoints: [],
      tags: [],
    }

  } catch (error) {
    console.error('Ollama processing error:', error)
    throw error
  }
}

async function generateTitleWithOllama(transcript: string): Promise<string> {
  try {
    const prompt = `Generate a short, descriptive title (3-6 words) for this voice note:

"${transcript.substring(0, 500)}..."

Respond with ONLY the title, no quotes or extra text.`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          max_tokens: 20
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const ollamaResult = await response.json()
    const title = (ollamaResult.response || 'Voice Note').trim().replace(/^["']|["']$/g, '')

    return title.length > 50 ? title.substring(0, 47) + '...' : title

  } catch (error) {
    console.error('Title generation error:', error)
    return 'Voice Note'
  }
}