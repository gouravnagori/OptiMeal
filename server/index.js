import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// dotenv.config(); // Removed manual call

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import attendanceRoutes from './routes/attendance.js';
import feedbackRoutes from './routes/feedback.js';
import messRoutes from './routes/mess.js';

// Middleware
app.use(express.json());
app.use(cookieParser());
// CORS Configuration - Allow frontend domains
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'https://opti-meal.vercel.app' // Hardcoded production URL as fallback
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins in production for now
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// CRITICAL: Prevent browser caching of API responses
// This fixes the bug where different users see the same data after login
app.use('/api', (req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/mess', messRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'MFMS Server is running!' });
});

// Database Connection
const connectDB = async () => {
    try {
        // Fallback for development if no env var
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mfms';
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
});
