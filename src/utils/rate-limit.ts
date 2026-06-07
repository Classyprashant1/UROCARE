import { logger } from './logger';

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// In-memory store
const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minute default
): { success: boolean; error?: string } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  // If window has passed, reset count
  if (now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  // If within window and over limit
  if (entry.count >= limit) {
    logger.warn('Rate limit exceeded', { identifier, limit, windowMs });
    return { success: false, error: 'Too many requests. Please try again later.' };
  }

  // Increment count
  entry.count += 1;
  rateLimitMap.set(identifier, entry);
  return { success: true };
}
