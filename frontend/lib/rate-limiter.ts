import { NextRequest } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (for single server deployment)
// For multi-server deployments, use Redis or similar
const rateLimitStore = new Map<string, RateLimitStore>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier?: string; // Custom identifier (defaults to IP)
}

export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const { windowMs, maxRequests, identifier } = options;
  
  // Get identifier (IP address or custom)
  const id = identifier || 
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  
  const now = Date.now();
  const storeKey = `rate_limit_${id}`;
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(storeKey);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(storeKey, entry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(storeKey, entry);
  
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

