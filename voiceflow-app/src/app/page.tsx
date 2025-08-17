import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Mic, Zap, Shield, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="gradient-bg bg-clip-text text-transparent">
              VoiceFlow
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8">
            From thought to text in seconds
          </p>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Transform your voice notes into organized, searchable text with the power of AI. 
            Perfect transcription, intelligent summaries, and seamless organization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl" className="gradient-bg text-white border-0">
              <Link href="/auth/signin">
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="xl">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Demo Video Placeholder */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-medium">Demo Video Coming Soon</p>
                <p className="text-sm opacity-80">See VoiceFlow in action</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to capture, transcribe, and organize your thoughts efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Real-time Recording */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Real-time Recording</CardTitle>
                <CardDescription>
                  High-quality voice recording with live waveform visualization and intuitive controls
                </CardDescription>
              </CardHeader>
            </Card>

            {/* AI Transcription */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>AI Transcription</CardTitle>
                <CardDescription>
                  OpenAI Whisper-powered transcription with high accuracy and support for multiple audio formats
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Smart Processing */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Smart Processing</CardTitle>
                <CardDescription>
                  Claude AI automatically cleans, summarizes, and extracts key points from your transcripts
                </CardDescription>
              </CardHeader>
            </Card>

            {/* File Upload */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>File Upload</CardTitle>
                <CardDescription>
                  Drag & drop support for MP3, WAV, M4A, and WebM files with progress tracking
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Organization */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle>Smart Organization</CardTitle>
                <CardDescription>
                  Search, filter, and export your recordings with automatic tagging and categorization
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Security */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is encrypted and secure with Google/GitHub authentication and privacy controls
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already transforming their voice notes with VoiceFlow
          </p>
          
          <Button asChild size="xl" className="gradient-bg text-white border-0">
            <Link href="/auth/signin">
              <Mic className="mr-2 h-5 w-5" />
              Start for Free
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}