import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'

export async function GET(request: NextRequest) {
  try {
    // Test if Anthropic API key is configured
    if (!anthropic) {
      return NextResponse.json({ 
        success: false,
        error: 'Anthropic API key not configured',
        details: 'ANTHROPIC_API_KEY environment variable is missing'
      }, { status: 500 })
    }

    // Test API connection with a simple message
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Say "API test successful" if you can read this message.'
      }]
    })

    const content = message.content[0]
    const responseText = content.type === 'text' ? content.text : 'No text response'

    return NextResponse.json({
      success: true,
      message: 'Anthropic API key is working correctly!',
      details: {
        modelUsed: 'claude-3-haiku-20240307',
        apiKeyValid: true,
        connectionStatus: 'success',
        testResponse: responseText
      }
    })

  } catch (error) {
    console.error('Anthropic API test error:', error)
    
    // Handle different types of errors
    let errorMessage = 'Unknown error occurred'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = 'Invalid API key - Please check your Anthropic API key'
        statusCode = 401
      } else if (error.message.includes('403')) {
        errorMessage = 'API key lacks permissions or quota exceeded'
        statusCode = 403
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded - Please try again later'
        statusCode = 429
      } else if (error.message.includes('ECONNRESET') || error.message.includes('Connection')) {
        errorMessage = 'Network connection error - Please check your internet connection'
        statusCode = 502
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: statusCode })
  }
}