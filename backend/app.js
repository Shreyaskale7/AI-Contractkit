// backend/app.js
// Builds and exports the configured Express app WITHOUT connecting to the
// database or starting a listener. server.js wires those for production;
// the test suite imports this app directly and supplies its own in-memory DB.
const express = require('express');
const cors = require('cors');
require('express-async-errors'); // handles async errors automatically
const { apiLimiter } = require('./middleware/rateLimiters');

const app = express();

// Behind Render/Vercel proxies — needed so req.ip is the real client IP
// (used for the signature audit trail and rate limiting)
app.set('trust proxy', 1);

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
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});

module.exports = app;
