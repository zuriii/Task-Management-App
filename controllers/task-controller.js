const catchAsync = require("../utils/catchAsync");
const { getCustomId } = require("../utils/custom-id");
const Task = require("../models/task");
const { ResponseCodes } = require("../enums/response-codes");
const { sendResponse } = require("../utils/response-handler");

// Create a new task
exports.createTask = catchAsync(async (req, res) => {
  const { title, description, status, assign_users } = req.body;

  if (
    !assign_users ||
    !Array.isArray(assign_users) ||
    assign_users.length === 0
  ) {
    return sendResponse(
      res,
      ResponseCodes.BadRequest,
      "assign_users cannot be empty. Please provide at least one user."
    );
  }

  const task = await Task.create({
    id: await getCustomId(Task),
    title,
    description,
    status,
    assign_users,
    added_by: req.user.id,
  });

  return sendResponse(
    res,
    ResponseCodes.Created,
    "Task created successfully",
    task
  );
});

// Get tasks with pagination
exports.getTasks = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // If not admin, restrict to tasks assigned/added by the user
  if (req.user.role !== "admin") {
    query = {
      $or: [{ assign_users: req.user.id }, { added_by: req.user.id }],
    };
  }

  const tasks = await Task.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalTasks = await Task.countDocuments(query);
  const totalPages = Math.ceil(totalTasks / limit);

  return sendResponse(
    res,
    ResponseCodes.Success,
    "Tasks fetched successfully",
    {
      page,
      totalPages,
      results: tasks.length,
      totalTasks,
      tasks,
    }
  );
});

// Update a task
exports.updateTask = catchAsync(async (req, res) => {
  const { assign_users, ...rest } = req.body;

  const task = await Task.findOne({ id: req.params.id });
  if (!task) {
    return sendResponse(res, ResponseCodes.NotFound, "Task not found");
  }

  if (!task.assign_users.includes(req.user.id) && req.user.role !== "admin") {
    return sendResponse(
      res,
      ResponseCodes.Forbidden,
      "You are not authorized to update this task"
    );
  }

  const updateData = { ...rest, updated_by: req.user.id };
  if (assign_users) updateData.assign_users = assign_users;

  const updatedTask = await Task.findOneAndUpdate(
    { id: req.params.id },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  return sendResponse(
    res,
    ResponseCodes.Success,
    "Task updated successfully",
    updatedTask
  );
});

// Delete a task
exports.deleteTask = catchAsync(async (req, res) => {
  const task = await Task.findOne({ id: req.params.id });
  if (!task) {
    return sendResponse(res, ResponseCodes.NotFound, "Task not found");
  }

  // Only allow if user is assigned OR admin
  if (!task.assign_users.includes(req.user.id) && req.user.role !== "admin") {
    return sendResponse(
      res,
      ResponseCodes.Forbidden,
      "You are not authorized to delete this task"
    );
  }

  await Task.findOneAndDelete({ id: req.params.id });

  return sendResponse(res, ResponseCodes.Success, "Task deleted successfully");
});
