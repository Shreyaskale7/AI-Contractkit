// backend/server.js
// ─────────────────────────────────────────
// Production entry point: load env, connect to MongoDB, start the server.
// The Express app itself lives in app.js so it can be imported by tests.
// ─────────────────────────────────────────

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

// Connect to MongoDB, then start listening
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
