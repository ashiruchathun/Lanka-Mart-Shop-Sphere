const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lanka Mart ShopSphere API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS database_name"
    );

    res.status(200).json({
      status: "OK",
      service: "ShopSphere Backend",
      database: rows[0].database_name,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
    });
  }
});

async function startServer() {
  try {
    const connection = await db.getConnection();

    console.log("MySQL database connected successfully");
    connection.release();

    app.listen(PORT, () => {
      console.log(
        `ShopSphere server running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    process.exit(1);
  }
}

startServer();