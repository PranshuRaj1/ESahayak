import type { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit({
  interval = 60 * 1000, // 1 minute
  uniqueTokenPerInterval = 500, // Max 500 unique tokens per interval
  tokensPerInterval = 10, // Max 10 requests per token per interval
}: {
  interval?: number
  uniqueTokenPerInterval?: number
  tokensPerInterval?: number
} = {}) {
  return {
    check: (request: NextRequest, limit: number = tokensPerInterval, token?: string) => {
      const tokenId = token || getIP(request) || "anonymous"
      const now = Date.now()
      const resetTime = now + interval

      if (!store[tokenId]) {
        store[tokenId] = {
          count: 0,
          resetTime,
        }
      }

      const tokenData = store[tokenId]

      if (now > tokenData.resetTime) {
        tokenData.count = 0
        tokenData.resetTime = resetTime
      }

      if (tokenData.count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: new Date(tokenData.resetTime),
        }
      }

      tokenData.count++

      return {
        success: true,
        limit,
        remaining: limit - tokenData.count,
        reset: new Date(tokenData.resetTime),
      }
    },
  }
}

function getIP(request: NextRequest): string | null {
  const xff = request.headers.get("x-forwarded-for")
  return xff ? xff.split(",")[0] : request.headers.get("x-real-ip")
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}, 60 * 1000) // Clean up every minute
