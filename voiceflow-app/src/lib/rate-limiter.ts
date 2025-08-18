import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number
  max: number
  keyGenerator?: (req: NextRequest) => string
}

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, max, keyGenerator = defaultKeyGenerator } = config

  return async (req: NextRequest) => {
    const key = keyGenerator(req)
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key]
    }

    if (!store[key]) {
      store[key] = { count: 1, resetTime: now + windowMs }
      return { success: true, remaining: max - 1 }
    }

    if (store[key].count >= max) {
      return { 
        success: false, 
        remaining: 0,
        resetTime: store[key].resetTime
      }
    }

    store[key].count++
    return { 
      success: true, 
      remaining: max - store[key].count 
    }
  }
}

function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
  return ip
}

// Predefined rate limiters
export const transcribeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 requests per 15 minutes
})

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
})

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5 // 5 uploads per minute
})
