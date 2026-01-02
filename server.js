import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { cacheMiddleware } from './middlewares/cache.js';
import authRoutes from './routes/userRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all requests
app.use(limiter);

// CORS configuration with detailed logging
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Request from origin:', origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }

    // Allow ANY localhost origin for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// JSON parsing error handler (must come after express.json())
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parsing Error:', err.message);
    return res.status(400).json({
      error: 'Invalid JSON format',
      details: err.message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  next(err);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
// app.use('/api/jobs', cacheMiddleware(300000), jobRoutes); // Cache jobs for 5 minutes - DISABLED for Dev consistency
app.use('/api/jobs', jobRoutes);
// app.use('/api', cacheMiddleware(180000), proposalRoutes); // Cache proposals for 3 minutes - DISABLED for Dev consistency
app.use('/api', proposalRoutes);
app.use('/api/contracts', contractRoutes); // No cache - real-time data
app.use('/api/payments', paymentRoutes); // No cache - financial data


if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
