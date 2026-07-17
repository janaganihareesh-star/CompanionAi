const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { createClient } = require('redis');

// Initialize Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let isRedisConnected = false;
let hasLoggedRedisError = false;

redisClient.on('error', (err) => {
  if (!hasLoggedRedisError) {
    console.warn('[Redis] Rate Limiter Redis Connection Error - Falling back to MemoryStore');
    hasLoggedRedisError = true;
  }
  isRedisConnected = false;
});

redisClient.on('connect', () => {
  console.log('[Redis] Rate Limiter connected to Redis');
  isRedisConnected = true;
});

// Try to connect, but don't block the app if it fails
redisClient.connect().catch(() => {});

// Helper function to optionally use Redis store
const getStore = () => {
  if (isRedisConnected) {
    return new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
  }
  return undefined; // Falls back to default memory store
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // Increased to support rich SPA dashboard navigation
  store: getStore(),
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  store: getStore(),
  message: {
    success: false,
    message: 'AI request rate limit exceeded. Please wait 1 minute before sending another message.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Max 15 messages per minute to prevent DB/Socket choking
  store: getStore(),
  message: {
    success: false,
    message: 'Spam detected. You are sending messages too fast.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpGenerateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3,
  store: getStore(),
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const otpVerifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  store: getStore(),
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please wait a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  aiLimiter,
  messageLimiter,
  otpGenerateLimiter,
  otpVerifyLimiter
};