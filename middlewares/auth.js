import jwt from 'jsonwebtoken';


export function signAccessToken(payload) {
return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });
}


export function signRefreshToken(payload) {
return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' });
}


export function setRefreshCookie(res, token) {
res.cookie('jid', token, {
httpOnly: true,
sameSite: 'lax',
secure: process.env.NODE_ENV === 'production',
path: '/auth/refresh'
});
}


export function authRequired(req, res, next) {
try {
const auth = req.headers.authorization;
let token = null;
if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];
if (!token && req.cookies?.access) token = req.cookies.access;
if (!token) return res.status(401).json({ message: 'Unauthorized' });


const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
req.user = decoded; // { userId, tokenVersion }
next();
} catch (e) {
return res.status(401).json({ message: 'Invalid or expired token' });
}
}