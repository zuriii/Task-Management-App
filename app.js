require("dotenv").config(); // Load .env
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
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

// Global error handler
app.use(globalErrorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("DB connection successful"))
  .catch(err => {
    console.log("DB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

module.exports = app;
