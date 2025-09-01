import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import { generalLimiter } from './middlewares/rateLimit.js';

dotenv.config();
await connectDB();

const app = express();

// ✅ Trust first proxy (needed for secure cookies behind Render, Vercel, etc.)
app.set('trust proxy', 1);


app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(generalLimiter);

app.get("/",(req,res)=>{
    return res.json({ success: "hello from backend"})
})

app.use('/auth',  authRoutes);
app.use('/notes', notesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port http://localhost:${PORT}`));
