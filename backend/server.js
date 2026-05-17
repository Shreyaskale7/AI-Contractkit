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

// Load .env variables into process.env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// MIDDLEWARE
// express.json() lets us read JSON from request body (req.body)
// cors() lets our React frontend (different port) talk to this server
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));