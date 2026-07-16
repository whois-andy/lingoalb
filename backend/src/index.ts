import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { startCronJobs } from './utils/cronJobs';

// Routes
import authRoutes from './routes/auth';
import languageRoutes from './routes/languages';
import levelRoutes from './routes/levels';
import lessonRoutes from './routes/lessons';
import progressRoutes from './routes/progress';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import leaderboardRoutes from './routes/leaderboard';
import dailyRoutes from './routes/daily';

// Load .env FIRST before anything else reads process.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const IS_DEV = process.env.NODE_ENV !== 'production';

// Connect to MongoDB
connectDB();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin === (process.env.FRONTEND_URL || 'http://localhost:3000')
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight
app.options('*', cors());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// In development: DISABLED (set to 10,000 requests) so you never hit it
// In production: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_DEV ? 10000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => IS_DEV, // completely skip rate limiting in development
  message: { message: 'Shumë kërkesa. Provoni përsëri pas pak minutash.' },
});
app.use('/api/', limiter);

// Only rate-limit login/register more strictly (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_DEV ? 500 : 20,
  skip: () => IS_DEV,
  message: { message: 'Shumë përpjekje identifikimi. Prisni 15 minuta.' },
});

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (IS_DEV) {
  app.use(morgan('dev'));
}

// ── Cache headers for public endpoints ───────────────────────────────────────
app.use('/api/languages', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=60'); // cache 60s
  }
  next();
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: IS_DEV ? 'development' : 'production',
    rateLimit: IS_DEV ? 'disabled' : 'enabled',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/daily', dailyRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Rruga nuk u gjet.', code: 'NOT_FOUND' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ message: 'Gabim i brendshëm i serverit.', code: 'SERVER_ERROR' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 LingoAlb API running!');
  console.log(`   URL:        http://localhost:${PORT}`);
  console.log(`   Health:     http://localhost:${PORT}/health`);
  console.log(`   Mode:       ${IS_DEV ? '🛠  Development (rate limit OFF)' : '🔒 Production'}`);
  console.log('');
  startCronJobs();
});

export default app;
