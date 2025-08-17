'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Mail, User } from 'lucide-react'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
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
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={() => handleSignIn('demo')}
          disabled={isLoading}
        >
          <User className="mr-2 h-4 w-4" />
          Try Demo (No signup required)
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

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => handleSignIn('google')}
          disabled={isLoading}
        >
          <Mail className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
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
        
        <p className="text-xs text-center text-muted-foreground">
          OAuth providers require API keys to be configured
        </p>
      </CardContent>
    </Card>
  )
}