// backend/middleware/rateLimiters.js
// Centralized rate limiters so every route pulls from one source of truth.
// Tiers, from loosest to strictest:
//   apiLimiter      — coarse global guard against runaway clients
//   authLimiter     — slows credential brute-forcing on login/register
//   aiLimiter       — protects the expensive (paid) LLM generation endpoints
//   publicRead/Write/eli5 — for the unauthenticated public contract pages
const rateLimit = require('express-rate-limit');

const json = (message) => ({ message });

// Global: applied once in server.js to every request.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many requests — please slow down and try again shortly.'),
});

// Auth: tight, to make password guessing impractical.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many login attempts — please try again in a few minutes.'),
});

// AI generation: each call costs real Groq tokens, so cap per-user/IP usage.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('AI generation limit reached for this hour — please try again later.'),
});

// ── Public (unauthenticated) contract pages ──
const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many requests — please try again later.'),
});
const eli5Limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10, // triggers a paid AI call on cache miss
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many translation requests — please try again later.'),
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
  publicReadLimiter,
  publicWriteLimiter,
  eli5Limiter,
};
