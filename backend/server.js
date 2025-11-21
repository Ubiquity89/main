const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const progressRoutes = require("./routes/progressRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");
const gfgRoutes = require("./routes/gfgRoutes");
const hackerrankRoutes = require("./routes/hackerrankRoutes");
const codechefRoutes = require("./routes/codechefRoutes");
const codeforcesRoutes = require("./routes/codeforcesRoutes");

dotenv.config();

const app = express();

// Middleware
// CORS configuration
// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "http://localhost:5177",
  "http://localhost:5174",
  "https://main-bkub.vercel.app",     // stable production
  "https://main-xj5n.onrender.com"    // backend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // Allow ALL Vercel preview deployments:
    // https://anything-ubiquity89s-projects.vercel.app
    if (/https:\/\/.*-ubiquity89s-projects\.vercel\.app$/.test(origin)) {
      console.log("Allowed Vercel Preview:", origin);
      return callback(null, true);
    }

    // Allow fixed origins
    if (allowedOrigins.includes(origin)) {
      console.log("Allowed Origin:", origin);
      return callback(null, true);
    }

    console.warn("❌ BLOCKED ORIGIN:", origin);
    return callback(new Error("CORS blocked: Origin not allowed"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  maxAge: 86400
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/gfg", gfgRoutes);
app.use("/api/hackerrank", hackerrankRoutes);
app.use("/api/codechef", codechefRoutes);
app.use("/api/codeforces", codeforcesRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Coding Progress Dashboard API" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Environment:", process.env.NODE_ENV);
  console.log("CORS origin:", [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:5174",
  ]);
});
