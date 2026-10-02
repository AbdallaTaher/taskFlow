const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      required: [true, "Checklist item text is required"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const activitySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Activity entry must have descriptive text"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["created", "status_change", "checklist_update", "updated", "comment"],
      default: "updated",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task must have a title"],
      trim: true,
      maxlength: [120, "Task title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Task description cannot exceed 2000 characters"],
    },
    project: {
      type: String,
      trim: true,
      default: "General",
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A task must belong to a user"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    previousStatus: {
      type: String,
      enum: ["todo", "in-progress", null],
      default: null,
    },
    dueDate: {
      type: Date,
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    activity: {
      type: [activitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for high-speed queries by user and filters
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ owner: 1, priority: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
