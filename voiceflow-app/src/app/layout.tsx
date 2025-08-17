import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Navbar } from '@/components/layout/navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VoiceFlow - From thought to text in seconds',
  description: 'A modern voice notes app with AI-powered transcription and text processing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="voiceflow-theme"
        >
          <SessionProvider>
            <Navbar />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}