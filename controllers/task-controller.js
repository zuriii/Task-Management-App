const catchAsync = require("../utils/catchAsync");
const { getCustomId } = require("../utils/custom-id");
const Task = require("../models/task");

// Create a new task
exports.createTask = catchAsync(async (req, res) => {
  const { title, description, status, assign_users } = req.body;

  if (
    !assign_users ||
    !Array.isArray(assign_users) ||
    assign_users.length === 0
  ) {
    return res.status(400).json({
      status: "fail",
      message:
        "assign_users cannot be empty. Please provide at least one user.",
    });
  }

  const task = await Task.create({
    id: await getCustomId(Task),
    title,
    description,
    status,
    assign_users,
    added_by: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: task,
  });
});

exports.getTasks = catchAsync(async (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page, 10) || 1; // default page 1
  const limit = parseInt(req.query.limit, 10) || 10; // default 10 tasks per page
  const skip = (page - 1) * limit;

  // Fetch tasks assigned to the logged-in user with pagination
  const tasks = await Task.find({ assign_users: req.user.id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Total count for pagination info
  const totalTasks = await Task.countDocuments({ assign_users: req.user.id });
  const totalPages = Math.ceil(totalTasks / limit);

  res.status(200).json({
    status: "success",
    page,
    totalPages,
    results: tasks.length,
    totalTasks,
    data: tasks,
  });
});

// Update a task
exports.updateTask = catchAsync(async (req, res) => {
  const { assign_users, ...rest } = req.body;

  // Find the task first
  const task = await Task.findOne({ id: req.params.id });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }


  // Check if logged-in user is in Assign_users
  if (!task.assign_users.includes(req.user.id)) {
    return res
      .status(403)
      .json({ message: "You are not authorized to update this task" });
  }

  const updateData = {
    ...rest,
    updated_by: req.user.id,
  };

  if (assign_users) updateData.assign_users = assign_users;

  // Update the task
  const updatedTask = await Task.findOneAndUpdate(
    { id: req.params.id },
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedTask,
  });
});

// Delete a task
exports.deleteTask = catchAsync(async (req, res) => {
  const task = await Task.findOne({ id: req.params.id });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (!task.assign_users.includes(req.user.id)) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this task" });
  }

  // Delete the task
  await Task.findOneAndDelete({ id: req.params.id });

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});
