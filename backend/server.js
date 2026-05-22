const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donorRoutes = require("./routes/donorRoutes");
const patientRoutes = require("./routes/patientRoutes"); // ✅ add this

const { testDbConnection } = require("./db");

const app = express();
const PORT = 5000;

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Blood Donation API is running");
});

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/patient", patientRoutes); // ✅ add this

console.log("✅ Mounted routes: /api/auth, /api/admin, /api/donor, /api/patient");

// 404 should be LAST
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// start server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  await testDbConnection();
});