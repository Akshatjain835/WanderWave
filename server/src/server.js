import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/currency', currencyRoutes);

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WanderWave Agentic AI Trip Planner Server is running smoothly 🚀',
    timestamp: new Date().toISOString()
  });
});

// Database Connection
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderwave';
    await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected successfully to ${connStr}`);
  } catch (err) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB instance: ${err.message}`);
    console.warn(`[MongoDB Warning] Server running in memory fallback / offline mode until DB connects.`);
  }
};

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`[Server] WanderWave backend listening on http://localhost:${PORT}`);
});
