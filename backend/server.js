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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "http://localhost:5177", 
  "http://localhost:5174",
  "https://main-bkub-rj3hj4m6a-ubiquity89s-projects.vercel.app",
  "https://main-xj5n.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.warn(`CORS error: ${origin} not allowed`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24 hours
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
