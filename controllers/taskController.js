const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const cache = require("../utils/cache");

const filterAllowedFields = (body) => {
  const allowedFields = [
    "title",
    "description",
    "project",
    "priority",
    "status",
    "previousStatus",
    "dueDate",
    "checklist",
  ];

  const filteredBody = {};

  Object.keys(body).forEach((key) => {
    if (allowedFields.includes(key)) filteredBody[key] = body[key];
  });

  return filteredBody;
};

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cacheKey = `user:${userId}:stats`;

  const cachedStats = cache.get(cacheKey);
  if (cachedStats) {
    return res.status(200).json({
      status: "success",
      source: "cache",
      data: {
        stats: cachedStats,
      },
    });
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Execute database aggregation and supporting queries in parallel for maximum speed
  const [aggregateResultArr, tasksWithActivity, todayTasks] = await Promise.all([
    Task.aggregate([
      { $match: { owner: userObjectId } },
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
          overdue: [
            {
              $match: {
                status: { $ne: "done" },
                dueDate: { $lt: now, $ne: null },
              },
            },
            { $count: "count" },
          ],
          dueToday: [
            {
              $match: {
                dueDate: { $gte: startOfToday, $lte: endOfToday },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),
    Task.find({
      owner: userId,
      "activity.0": { $exists: true },
    })
      .select("title activity")
      .sort("-updatedAt")
      .limit(25)
      .lean(),
    Task.find({
      owner: userId,
      dueDate: { $gte: startOfToday, $lte: endOfToday },
    })
      .select("-activity")
      .sort("priority -createdAt")
      .limit(5)
      .lean(),
  ]);

  const aggregateResult = aggregateResultArr?.[0];

  const totalTasks = aggregateResult?.total[0]?.count || 0;
  const statusMap = (aggregateResult?.byStatus || []).reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
  const priorityMap = (aggregateResult?.byPriority || []).reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const completedTasks = statusMap["done"] || 0;
  const inProgressTasks = statusMap["in-progress"] || 0;
  const todoTasks = statusMap["todo"] || 0;
  const overdueTasks = aggregateResult?.overdue[0]?.count || 0;
  const dueTodayTasks = aggregateResult?.dueToday[0]?.count || 0;

  // Calculate focus score (0 to 100)
  let focusScore = 100;
  if (totalTasks > 0) {
    const rawScore =
      ((completedTasks + inProgressTasks * 0.5) / totalTasks) * 100 -
      overdueTasks * 5;
    focusScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  }

  const allActivities = [];
  tasksWithActivity.forEach((t) => {
    (t.activity || []).forEach((act) => {
      allActivities.push({
        _id: act._id,
        taskId: t._id,
        taskTitle: t.title,
        text: act.text,
        type: act.type,
        createdAt: act.createdAt,
      });
    });
  });

  allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentActivity = allActivities.slice(0, 20);

  const stats = {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    dueTodayTasks,
    focusScore,
    priority: {
      high: priorityMap["high"] || 0,
      medium: priorityMap["medium"] || 0,
      low: priorityMap["low"] || 0,
    },
    recentActivity,
    todayTasks,
  };

  // Cache dashboard stats for 30s per user
  cache.set(cacheKey, stats, 30);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getAllTasks = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const queryString = JSON.stringify(req.query);
  const cacheKey = `user:${userId}:tasks:${queryString}`;

  const cachedTasks = cache.get(cacheKey);
  if (cachedTasks) {
    return res.status(200).json({
      status: "success",
      source: "cache",
      results: cachedTasks.length,
      data: {
        tasks: cachedTasks,
      },
    });
  }

  const { status, priority, project, search, sort, dueDate } = req.query;

  const queryObj = { owner: userId };

  if (typeof status === "string" && status.trim()) queryObj.status = status.trim();
  if (typeof priority === "string" && priority.trim()) queryObj.priority = priority.trim();
  if (typeof project === "string" && project.trim()) queryObj.project = project.trim();

  if (dueDate === "today") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    queryObj.dueDate = { $gte: startOfToday, $lte: endOfToday };
  } else if (typeof dueDate === "string" && dueDate.trim()) {
    const targetDate = new Date(dueDate);
    if (!isNaN(targetDate.getTime())) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      queryObj.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }
  }

  if (typeof search === "string" && search.trim()) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    queryObj.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
      { project: { $regex: safeSearch, $options: "i" } },
    ];
  }

  let query = Task.find(queryObj);

  if (typeof sort === "string" && sort.trim()) {
    const sortFields = sort.split(",").join(" ");
    query = query.sort(sortFields);
  } else {
    query = query.sort("-createdAt");
  }

  // Omit full activity history from list view for high-speed lightweight payload
  const tasks = await query.select("-activity").lean();

  // Cache task list results for 30s
  cache.set(cacheKey, tasks, 30);

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.createTask = catchAsync(async (req, res) => {
  const newTask = await Task.create({
    title: req.body.title,
    description: req.body.description,
    project: req.body.project,
    priority: req.body.priority,
    status: req.body.status,
    dueDate: req.body.dueDate,
    checklist: req.body.checklist,
    owner: req.user._id,
    activity: [
      {
        text: "Task created",
        user: req.user._id,
        type: "created",
      },
    ],
  });

  cache.invalidateUser(req.user._id);

  res.status(201).json({
    status: "success",
    data: {
      task: newTask,
    },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  })
    .populate("owner", "name email photo role")
    .populate("activity.user", "name email photo");

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const filteredBody = filterAllowedFields(req.body);

  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError("No valid task fields provided for update", 400));
  }

  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  if (filteredBody.status && filteredBody.status !== task.status) {
    if (filteredBody.status === "done") {
      // Remember the status prior to completion
      task.previousStatus = task.status;
    } else if (task.status === "done") {
      // Reverted from done
      task.previousStatus = null;
    }

    task.activity.push({
      text: `Status changed from "${task.status}" to "${filteredBody.status}"`,
      user: req.user._id,
      type: "status_change",
    });
  } else {
    task.activity.push({
      text: "Task details updated",
      user: req.user._id,
      type: "updated",
    });
  }

  Object.assign(task, filteredBody);
  await task.save();

  cache.invalidateUser(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.toggleChecklistItem = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  const item = task.checklist.id(req.params.itemId);
  if (!item) {
    return next(new AppError("Checklist item not found", 404));
  }

  item.completed = req.body.completed !== undefined ? req.body.completed : !item.completed;

  // Auto-advance status from "todo" to "in-progress" when checklist progress begins
  if (item.completed && task.status === "todo") {
    task.status = "in-progress";
    task.activity.push({
      text: `Status automatically moved to "in-progress" due to checklist progress`,
      user: req.user._id,
      type: "status_change",
    });
  }

  task.activity.push({
    text: `Checklist item "${item.text}" marked as ${item.completed ? "completed" : "incomplete"}`,
    user: req.user._id,
    type: "checklist_update",
  });

  await task.save();

  cache.invalidateUser(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.addChecklistItem = catchAsync(async (req, res, next) => {
  if (!req.body.text || !req.body.text.trim()) {
    return next(new AppError("Checklist item text is required", 400));
  }

  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  const newItem = { text: req.body.text.trim(), completed: false };
  task.checklist.push(newItem);

  task.activity.push({
    text: `Added checklist item "${newItem.text}"`,
    user: req.user._id,
    type: "checklist_update",
  });

  await task.save();

  cache.invalidateUser(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.deleteChecklistItem = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  const item = task.checklist.id(req.params.itemId);
  if (!item) {
    return next(new AppError("Checklist item not found", 404));
  }

  const itemText = item.text;
  task.checklist.pull({ _id: req.params.itemId });

  task.activity.push({
    text: `Removed checklist item "${itemText}"`,
    user: req.user._id,
    type: "checklist_update",
  });

  await task.save();

  cache.invalidateUser(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  cache.invalidateUser(req.user._id);

  res.status(204).send();
});
