const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const apiRoutes = require("./routes");
const mysql = require("mysql2");
//const db = require("./config");

// Load environment variables
//dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: 12464,
  ssl: {
    rejectUnauthorized: false, // Ensures SSL verification
  },
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("Connected to MySQL Database ✅");

    db.query("SHOW TABLES", (err, tables) => {
      if (err) {
        console.error("Error checking tables:", err);
      } else {
        console.log("Available tables:", tables.map(t => Object.values(t)[0]));
      }
    });
  }
});


// Test DB connection
db.query("SELECT 1", (err, result) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connection successful");
  }
});

// Mount API routes
app.use("/api", apiRoutes);

// Serve static files if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.get("/api/profile/:email", (req, res) => {
  const email = req.params.email;
  
  const query = "SELECT * FROM user_data WHERE email = ?";

  db.query(query, [email], (err, result) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal Server Error" });
      }
      if (result.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      res.json(result[0]);
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;