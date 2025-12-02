// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();
// const joinRequestRoutes = require("./routes/joinRequests");

// const app = express();

// // CORS configuration - allow frontend connection
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// const invitationRoutes = require("./routes/invitations");
// // Serve uploaded payment proofs
// app.use(
//   "/uploads/payments",
//   express.static(require("path").join(__dirname, "uploads/payments"))
// );
// // Database connection
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected Successfully"))
//   .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// // Import and use routes
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/groups", require("./routes/groups"));
// app.use("/api/members", require("./routes/members"));
// app.use("/api/cycles", require("./routes/cycles"));
// app.use("/api/payments", require("./routes/payments"));
// app.use("/api/invitations", invitationRoutes);
// app.use("/api/join-requests", joinRequestRoutes);
// // mount PhonePe routes (use the file you already have)
// app.use("/api/phonepe", require("./routes/phonepeRoutes"));

// // Health check
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     message: "Peer2Loan API is running!",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Simple 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🎯 Server running on port ${PORT}`);
//   console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
//   console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
//   console.log(`🔗 Frontend: http://localhost:3000`);
// });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const passport = require("passport");
require("./config/passport");
const joinRequestRoutes = require("./routes/joinRequests");

const app = express();
const httpServer = createServer(app);

// CORS configuration - allow frontend connection
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket.IO authentication middleware
const jwt = require("jsonwebtoken");
const User = require("./models/User");

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User ${socket.user.name} connected (${socket.userId})`);

  // Join user to their own room for targeted notifications
  socket.join(`user_${socket.userId}`);

  socket.on("disconnect", () => {
    console.log(`User ${socket.user.name} disconnected`);
  });
});

// Make io available to other routes
app.set("io", io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const invitationRoutes = require("./routes/invitations");
// Serve uploaded payment proofs
app.use(
  "/uploads/payments",
  express.static(require("path").join(__dirname, "uploads/payments"))
);

// Initialize Passport (must be before routes)
app.use(passport.initialize());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Import and use routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/members", require("./routes/members"));
app.use("/api/cycles", require("./routes/cycles"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/invitations", invitationRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/notifications", require("./routes/notifications"));
// mount PhonePe routes (use the file you already have)
app.use("/api/phonepe", require("./routes/phonepeRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Peer2Loan API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Simple 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend: http://localhost:3000`);
  console.log(`🔌 WebSocket server ready`);
});
