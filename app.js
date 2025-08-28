// app.js
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MERN Task API 🚀" });
});

// Example route file (we’ll create it later)
const taskRoutes = require("./routes/task-routes");
const userRoutes = require("./routes/user-routes");

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
