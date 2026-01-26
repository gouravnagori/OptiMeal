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

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.CLIENT_URL // Allow production domain (e.g., https://my-app.vercel.app)
    ].filter(Boolean), // Remove undefined if env var is missing
    credentials: true,
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
