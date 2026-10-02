const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load local environment config if present (e.g. running vercel dev locally)
dotenv.config({ path: "./config.env" });

const app = require("../app");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const DB = process.env.DATABASE;
  if (!DB) {
    throw new Error("DATABASE connection string is not defined in environment variables");
  }

  await mongoose.connect(DB);
  isConnected = true;
};

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Vercel Database Connection Error:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }

  return app(req, res);
};
