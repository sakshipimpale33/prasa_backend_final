const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const apiRoutes = require("./routes");
const db = require("./config");
const path = require("path"); // ✅ Import path module

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connection successful");
  }
});

// API Routes
app.use("/api", apiRoutes);

// User Profile Route
app.get("/api/profile/:email", (req, res) => {
  const email = req.params.email;
  const query = "SELECT * FROM user_data WHERE email = ?";

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result[0]);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ✅ Export Express app instead of `app.listen()`
module.exports = app;
