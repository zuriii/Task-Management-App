const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task-controller");
const { protect } = require("../controllers/auth-controller"); // assuming you have auth

// Protect all routes (only logged-in users can access)
router.use(protect);

// Get all tasks for logged-in user
router.get("/", taskController.getTasks);

// Create a new task
router.post("/", taskController.createTask);

// Update a task by id
router.patch("/:id", taskController.updateTask);

// Delete a task by id
router.delete("/:id", taskController.deleteTask);

module.exports = router;
