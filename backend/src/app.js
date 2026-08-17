import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRoutes from './routes/leadRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());

// API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Leads Tracking API is healthy and running',
    timestamp: new Date().toISOString()
  });
});

// Mount Main API Routes
app.use('/api/leads', leadRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server (only if not imported by test suites)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
  });
}

export default app;
