import rateLimit from 'express-rate-limit';


export const otpLimiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 5,
standardHeaders: true,
legacyHeaders: false,
message: { message: 'Too many OTP requests. Try again later.' }
});


export const generalLimiter = rateLimit({
windowMs: 1 * 60 * 1000,
max: 120,
});