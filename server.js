import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { cacheMiddleware } from './middlewares/cache.js';
import { searchService } from './services/searchService.js';
import authRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration with detailed logging
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow all localhost origins
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      console.log('✅ Allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    // Allow specific production domains
    const allowedOrigins = [
      'https://your-frontend-domain.com',
      'https://your-app.vercel.app',
      'https://your-app.netlify.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Allowing production origin:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error(`CORS blocked: Origin ${origin} not allowed`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ 
    error: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', cacheMiddleware(300000), jobRoutes); // Cache jobs for 5 minutes
app.use('/api', cacheMiddleware(180000), proposalRoutes); // Cache proposals for 3 minutes
app.use('/api/contracts', contractRoutes); // No cache - real-time data
app.use('/api/payments', paymentRoutes); // No cache - financial data
app.use('/api/search', cacheMiddleware(60000), searchRoutes); // Cache search for 1 minute

// Initialize search index on startup
searchService.initializeIndex();


if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
