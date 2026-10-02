const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const sanitizeXSS = require("./utils/xssSanitizer");

dotenv.config({ path: "./config.env" });

const path = require("path");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// 1) Set Security HTTP Headers with Helmet
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// 2) Restrictive CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// 3) Global Rate Limiting (200 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  max: 200,
  windowMs: 15 * 60 * 1000,
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again in 15 minutes!",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});
app.use("/api", apiLimiter);

// 4) Stricter Auth Rate Limiting (20 attempts per 15 minutes per IP)
const authLimiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
  message: {
    status: "fail",
    message: "Too many authentication attempts from this IP, please try again after 15 minutes!",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/signup", authLimiter);
app.use("/api/v1/users/forgotPassword", authLimiter);

// 5) Body Parsers & Cookie Parser
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

// 6) Data Sanitization against NoSQL Query Injection (e.g. { $gt: "" })
app.use(mongoSanitize());

// 7) Data Sanitization against Cross-Site Scripting (XSS)
app.use(sanitizeXSS);

// 8) Serving static uploaded assets with 1-day caching headers for maximum performance
app.use("/public", express.static(path.join(__dirname, "public"), { maxAge: "1d" }));
app.use("/api/v1/public", express.static(path.join(__dirname, "public"), { maxAge: "1d" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 9) Application Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
