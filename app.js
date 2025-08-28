// app.js
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const globalErrorHandler = require("./utils/error-handler");
const taskRoutes = require("./routes/task-routes");
const userRoutes = require("./routes/user-routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MERN Task API 🚀" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.use(globalErrorHandler);

module.exports = app;
