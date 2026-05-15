// backend/config/db.js
// ─────────────────────────────────────────
// Mongoose connects Node.js to your MongoDB Atlas database.
// We call this function once in server.js at startup.
// ─────────────────────────────────────────

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};
module.exports = connectDB;