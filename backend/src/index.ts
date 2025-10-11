import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
// import authRoutes from './routes/auth';
import candidateRoutes from './routes/candidates';
import assessmentRoutes from './routes/assessments';
import jobPositionRoutes from './routes/jobPositions';
import numerologyRoutes from './routes/numerology';

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Initialize Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HR Profiling Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
// app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/job-positions', jobPositionRoutes);
app.use('/api/numerology', numerologyRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 HR Profiling Platform API running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});