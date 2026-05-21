// src/app.js
// Express application setup with all middleware and routes

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const candidateRoutes = require('./routes/candidate.routes');
const verificationRoutes = require('./routes/verification.routes');
const reportRoutes = require('./routes/report.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for PDF generation
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for auth endpoints
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Mock API Routes (Internal - simulates third-party APIs) ──────────────────
app.post('/mock-api/aadhaar/verify', (req, res) => {
  const { aadhaarNumber } = req.body;
  const valid = /^\d{12}$/.test(aadhaarNumber);
  res.json({
    status: valid ? 'verified' : 'failed',
    nameMatch: valid,
    dobMatch: valid,
    message: valid ? 'Aadhaar verified successfully' : 'Invalid Aadhaar format',
  });
});

app.post('/mock-api/pan/verify', (req, res) => {
  const { panNumber } = req.body;
  const valid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber?.toUpperCase());
  res.json({
    status: valid ? 'verified' : 'failed',
    panStatus: valid ? 'active' : 'invalid',
    message: valid ? 'PAN verified successfully' : 'Invalid PAN format',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/candidates', apiLimiter, candidateRoutes);
app.use('/api/verifications', apiLimiter, verificationRoutes);
app.use('/api/reports', apiLimiter, reportRoutes);

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
