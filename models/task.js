const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
    assign_users: {
      type: [String],
    },
    added_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

module.exports = mongoose.model("task", taskSchema);
