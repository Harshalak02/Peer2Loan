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
require("dotenv").config();
const passport = require("passport");
require("./config/passport");
const joinRequestRoutes = require("./routes/joinRequests");

const app = express();

// CORS configuration - allow frontend connection
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

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
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend: http://localhost:3000`);
});