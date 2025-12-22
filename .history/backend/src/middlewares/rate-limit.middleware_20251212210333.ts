import rateLimit from 'express-rate-limit';
import { config } from '../config';

// Rate limiter for login endpoint (5 attempts per 15 minutes as per spec)
export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.login.windowMs,
  max: config.rateLimit.login.max,
  message: {
    error: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for complaint submission (10 per hour as per spec)
export const complaintRateLimiter = rateLimit({
  windowMs: config.rateLimit.complaint.windowMs,
  max: config.rateLimit.complaint.max,
  message: {
    error: 'Too many complaints submitted. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.userId?.toString() || req.ip || 'unknown';
  },
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
