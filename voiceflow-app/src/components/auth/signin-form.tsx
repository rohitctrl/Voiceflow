'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Mail, User } from 'lucide-react'
import type { ClientSafeProvider } from 'next-auth/react'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    setError('')
    try {
      console.log('Attempting sign in with provider:', provider)
      
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: false
      })
      
      console.log('Sign in result:', result)
      
      if (result?.error) {
        setError(`Login failed: ${result.error}`)
      } else if (result?.ok) {
        // Successful login, redirect to dashboard
        window.location.href = '/dashboard'
      } else if (result?.url) {
        // Follow redirect URL
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome to VoiceFlow</CardTitle>
        <CardDescription>
          From thought to text in seconds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <Button
          variant="default"
          size="lg"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          onClick={() => handleSignIn('demo')}
          disabled={isLoading}
        >
          <User className="mr-2 h-4 w-4" />
          {isLoading ? 'Signing in...' : 'Try Demo (No signup required)'}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {providers?.google && (
          <Button
            variant="outline"
            size="lg"
            className="w-full border-2 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => handleSignIn('google')}
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4 text-blue-500" />
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        )}
        
        {providers?.github && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleSignIn('github')}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        )}
        
        {!providers?.google && !providers?.github && (
          <p className="text-xs text-center text-muted-foreground">
            OAuth providers require API keys to be configured
          </p>
        )}
        
        {(!providers?.google && !providers?.github) && (
          <p className="text-xs text-center text-muted-foreground">
            Demo mode is available. Configure OAuth providers for additional login options.
          </p>
        )}
      </CardContent>
    </Card>
  )
}