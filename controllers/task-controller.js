const Task = require("../models/task");
const catchAsync = require("../utils/catchAsync");
const { getCustomId } = require("../utils/custom-id");

// Create a new task
exports.createTask = catchAsync(async (req, res) => {
  const { title, description, status } = req.body;

  const task = await Task.create({
    id: await getCustomId(Task),
    title,
    description,
    status,
    added_by: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: task,
  });
});

// Get all tasks for the logged-in user
exports.getTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find();

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: tasks,
  });
});

// Update a task
exports.updateTask = catchAsync(async (req, res) => {
  const updateData = {
    ...req.body,
    updated_by: req.user.id,
  };

  const task = await Task.findOneAndUpdate({ id: req.params.id }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(200).json({
    status: "success",
    data: task,
  });
});

// Delete a task
exports.deleteTask = catchAsync(async (req, res) => {
  const task = await Task.findOneAndDelete({
    id: req.params.id,
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});
