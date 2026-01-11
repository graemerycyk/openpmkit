/**
 * Simple in-memory rate limiter for API routes
 * In production, use Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limits (per IP)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs?: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  // If no entry or window has expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  if (entry.count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    };
  }
  
  return {
    success: true,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP from request headers
 * Handles various proxy headers
 */
export function getClientIP(request: Request): string {
  // Check various headers that proxies use
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback - this won't work in production behind a proxy
  // but is useful for local development
  return 'unknown';
}

// Pre-configured rate limiters for different use cases
export const RATE_LIMITS = {
  // Demo API: 10 requests per minute per IP
  demo: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // Session API: 30 requests per minute per IP
  session: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  // Strict: 5 requests per minute (for expensive operations)
  strict: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;
