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

// 1. Production CORS Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://wanderwave.vercel.app',
  'https://wanderwave-pb5c4r99j-akshats-projects-19b508c8.vercel.app',
  process.env.CLIENT_URL,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// 2. Body Parser
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
