// backend/server.js
// ─────────────────────────────────────────
// This is the STARTING POINT of your backend.
// Node.js runs this file first when you do `npm run dev`
// ─────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('express-async-errors'); // handles async errors automatically
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiters');

// Load .env variables into process.env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Behind Render/Vercel proxies — needed so req.ip is the real client IP
// (used for the signature audit trail and rate limiting)
app.set('trust proxy', 1);

// MIDDLEWARE
// express.json() lets us read JSON from request body (req.body)
// cors() lets our React frontend (different port) talk to this server
app.use(express.json({ limit: '2mb' })); // signature images come in as base64
app.use(cors({
  origin: [
    'https://ai-contractkit.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Coarse global rate limit — a backstop against any single client flooding
// the API. Tighter per-area limits live on the auth and AI routes.
app.use('/api', apiLimiter);

// ROUTES
// Any request starting with /api/auth → goes to authRoutes
// Any request starting with /api/clients → goes to clientRoutes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/invoices',  require('./routes/invoiceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));
// Health check route — visit localhost:5000 to confirm server is running
app.get('/', (req, res) => res.send('AI ContractKit API is running ✅'));

// GLOBAL ERROR HANDLER — express-async-errors forwards thrown async errors here
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));