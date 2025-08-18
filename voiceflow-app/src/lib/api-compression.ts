import { NextResponse } from 'next/server'

export function compressResponse(data: any, status = 200) {
  const response = NextResponse.json(data, { status })
  
  // Add compression headers
  response.headers.set('Content-Encoding', 'gzip')
  response.headers.set('Vary', 'Accept-Encoding')
  
  // Cache control for API responses
  response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')
  
  return response
}

export function setCacheHeaders(response: NextResponse, maxAge = 3600) {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge / 2}`)
  return response
}
