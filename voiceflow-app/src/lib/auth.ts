import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  // Only use adapter for OAuth providers, not for credentials
  adapter: process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_CLIENT_ID ? PrismaAdapter(prisma) as any : undefined,
  providers: [
    // Demo credentials provider for development/testing
    CredentialsProvider({
      id: 'demo',
      name: 'Demo User',
      credentials: {},
      async authorize() {
        // Return a demo user for testing
        return {
          id: 'demo-user-id',
          name: 'Demo User',
          email: 'demo@voiceflow.com',
          image: '/api/placeholder/32/32'
        }
      },
    }),
    // Only include OAuth providers if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}