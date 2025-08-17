import Anthropic from '@anthropic-ai/sdk'

export const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null

export async function processTranscript(transcript: string) {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured')
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Please analyze this voice note transcript and provide:

1. A clean, well-formatted version of the text with proper punctuation and paragraphs
2. A concise summary (2-3 sentences)
3. Key points or action items (if any)
4. Relevant tags (3-5 single words)

Original transcript:
"${transcript}"

Please format your response as JSON with the following structure:
{
  "cleanedText": "...",
  "summary": "...",
  "keyPoints": ["...", "..."],
  "tags": ["...", "...", "..."]
}`
      }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      try {
        const result = JSON.parse(content.text)
        return {
          cleanedText: result.cleanedText || transcript,
          summary: result.summary || '',
          keyPoints: result.keyPoints || [],
          tags: result.tags || [],
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response:', parseError)
        return {
          cleanedText: transcript,
          summary: 'Failed to generate summary',
          keyPoints: [],
          tags: [],
        }
      }
    }

    throw new Error('Unexpected response format from Claude')
  } catch (error) {
    console.error('Text processing error:', error)
    throw new Error('Failed to process transcript')
  }
}

export async function generateTitle(transcript: string): Promise<string> {
  if (!anthropic) {
    return 'Voice Note'
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Generate a short, descriptive title (3-6 words) for this voice note transcript:

"${transcript.substring(0, 500)}..."

Just return the title, nothing else.`
      }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text.trim().replace(/^["']|["']$/g, '') // Remove quotes if present
    }

    return 'Voice Note'
  } catch (error) {
    console.error('Title generation error:', error)
    return 'Voice Note'
  }
}