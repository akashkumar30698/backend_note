import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import { otpLimiter, generalLimiter } from './middlewares/rateLimit.js';

dotenv.config();
await connectDB();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'https://project-eta-mocha-53.vercel.app', credentials: true }));
app.use(generalLimiter);

app.get("/",(req,res)=>{
    return res.json({ success: "hello from backend"})
})

app.use('/auth',  authRoutes);
app.use('/notes', notesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port http://localhost:${PORT}`));
