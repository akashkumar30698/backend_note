


import { Router } from 'express';
import crypto from 'crypto';
import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/sendEmail.js';
import { signAccessToken, signRefreshToken, setRefreshCookie } from '../middlewares/auth.js';
import jwt from 'jsonwebtoken';

const router = Router();

function hashCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

router.post('/request-otp', async (req, res) => {
    try {
        const { email, name, dateOfBirth } = req.body || {};
        if (!email) return res.status(400).json({ message: 'Email required' });

        // Check if it's a signup request
        if (name && dateOfBirth) {
            // 🔹 Handle signup case
            let existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists, please log in' });
            }

            // Create new user entry (without password, since OTP login)
            existingUser = new User({
                email,
                name,
                dateOfBirth,
                role: 'USER',
            });
            await existingUser.save();
        } else {
            // 🔹 Handle login case
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found, please sign up first' });
            }
        }

        // 🔑 Generate OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = hashCode(code);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await Otp.findOneAndUpdate(
            { email },
            { codeHash, expiresAt, attempts: 0 },
            { upsert: true, new: true }
        );

        await sendOtpEmail(email, code);

        return res.json({ message: 'OTP sent successfully' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Failed to send OTP' });
    }
});


router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body || {};
        if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

        const otp = await Otp.findOne({ email });
        if (!otp) return res.status(400).json({ message: 'No OTP requested' });
        if (otp.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });
        if (otp.attempts >= otp.maxAttempts) return res.status(429).json({ message: 'Too many attempts' });

        if (otp.codeHash !== hashCode(code)) {
            otp.attempts += 1;
            await otp.save();
            return res.status(400).json({ message: 'Invalid code' });
        }

        await Otp.deleteOne({ _id: otp._id });

        let user = await User.findOne({ email });
        if (!user) user = await User.create({ email });

        const payload = { userId: user._id.toString(), tokenVersion: user.tokenVersion };
        const access = signAccessToken(payload);
        const refresh = signRefreshToken(payload);
        setRefreshCookie(res, refresh);
         console.log("access: ",access)
        res.cookie('access', access, {
            httpOnly: false,                     // prevent JS access
            sameSite: 'none',                    // allow sending with same-site requests
            secure: false,                       // ❌ set false in dev
            maxAge: 1000 * 60 * 15,             // 15 minutes
        });

        return res.json({ message: 'Logged in', user: { id: user._id, email: user.email, name: user.name } });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Verification failed' });
    }
});


// Check if access cookie is valid
router.get("/check", (req, res) => {
  const token = req.cookies?.access;
  console.log("ye le token : ",token)

  if (!token) return res.json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return res.json({ loggedIn: true, email: decoded.email });
  } catch (err) {
    return res.json({ loggedIn: false });
  }
});


router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.jid;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || user.tokenVersion !== decoded.tokenVersion) return res.status(401).json({ message: 'Token invalid' });

        const payload = { userId: user._id.toString(), tokenVersion: user.tokenVersion };
        const access = signAccessToken(payload);
        const refresh = signRefreshToken(payload);
        setRefreshCookie(res, refresh);

        return res.json({ accessToken: access });
    } catch (e) {
        return res.status(401).json({ message: 'Refresh failed' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('jid', { path: '/auth/refresh' });
    res.clearCookie('access');
    return res.json({ message: 'Logged out' });
});

export default router;
