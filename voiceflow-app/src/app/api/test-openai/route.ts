import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function GET(request: NextRequest) {
  try {
    // Test if OpenAI API key is configured
    if (!openai) {
      return NextResponse.json({ 
        success: false,
        error: 'OpenAI API key not configured',
        details: 'OPENAI_API_KEY environment variable is missing'
      }, { status: 500 })
    }

    // Test API connection with a simple models list request (lightweight)
    const models = await openai.models.list()
    
    // Check if we can access Whisper model specifically
    const whisperModel = models.data.find(model => model.id === 'whisper-1')
    
    if (!whisperModel) {
      return NextResponse.json({ 
        success: false,
        error: 'Whisper model not available',
        details: 'whisper-1 model not found in your account'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'OpenAI API key is working correctly!',
      details: {
        whisperAvailable: true,
        modelId: whisperModel.id,
        apiKeyValid: true,
        connectionStatus: 'success'
      }
    })

  } catch (error) {
    console.error('OpenAI API test error:', error)
    
    // Handle different types of errors
    let errorMessage = 'Unknown error occurred'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Invalid API key - Please check your OpenAI API key'
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