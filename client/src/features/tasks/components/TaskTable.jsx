import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Circle,
  Edit3,
  Trash2,
  Calendar,
  CheckSquare,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { Spinner } from "../../../ui/Spinner";

export function TaskTable({ tasks = [], isLoading = false, onEditTask, onNewTask }) {
  const navigate = useNavigate();
  const { updateTask } = useUpdateTask();
  const { deleteTask, isDeleting } = useDeleteTask();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0d1525]/90 p-12 text-center backdrop-blur-md">
        <Spinner className="w-8 h-8 text-violet-500 mx-auto" text="Loading tasks..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0d1525]/90 p-12 text-center backdrop-blur-md shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 mb-4 ring-1 ring-violet-500/20">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No tasks found</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          No tasks match your current filter criteria or you haven't created any tasks yet.
        </p>
        {onNewTask && (
          <button
            onClick={onNewTask}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500 transition"
          >
            + Create New Task
          </button>
        )}
      </div>
    );
  }

  const handleToggleStatus = (e, task) => {
    e.stopPropagation();
    if (task.status === "done") {
      // Revert to previousStatus if recorded, or determine from checklist progress
      const targetStatus =
        task.previousStatus ||
        (task.checklist?.some((i) => i.completed) ? "in-progress" : "todo");
      updateTask({
        id: task._id,
        taskData: { status: targetStatus, previousStatus: null },
      });
    } else {
      // Mark as completed and record the current status as previousStatus
      updateTask({
        id: task._id,
        taskData: { status: "done", previousStatus: task.status },
      });
    }
  };

  const handleDelete = (e, taskId, title) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteTask(taskId);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((checkDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateProgress = (task) => {
    if (task.status === "done") return 100;
    if (task.checklist && task.checklist.length > 0) {
      const completed = task.checklist.filter((i) => i.completed).length;
      return Math.round((completed / task.checklist.length) * 100);
    }
    if (task.status === "in-progress") return 50;
    return 0;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d1525]/90 p-5 shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-separate border-spacing-y-2 text-left text-sm text-slate-200">
          <thead>
            <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Task</th>
              <th className="px-4 py-2">Project</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Progress</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const progress = calculateProgress(task);

              return (
                <tr
                  key={task._id}
                  onClick={() => onEditTask ? onEditTask(task) : navigate(`/tasks/${task._id}`)}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition duration-150"
                >
                  {/* Status Column with Badge & Hover State */}
                  <td className="rounded-l-2xl border border-r-0 border-white/10 px-4 py-3.5">
                    <button
                      onClick={(e) => handleToggleStatus(e, task)}
                      className={`group/status relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-150 cursor-pointer overflow-hidden ${
                        task.status === "done"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-amber-500/15 hover:border-amber-500/40 hover:text-amber-200"
                          : task.status === "in-progress"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-200"
                          : "bg-slate-500/10 border-slate-500/30 text-slate-300 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-200"
                      }`}
                      title={
                        task.status === "done"
                          ? `Return to previous status (${
                              task.previousStatus === "in-progress"
                                ? "In Progress"
                                : "To Do"
                            })`
                          : "Mark as completed"
                      }
                    >
                      {/* Normal view */}
                      <span className="flex items-center gap-1.5 group-hover/status:hidden">
                        {task.status === "done" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : task.status === "in-progress" ? (
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>
                          {task.status === "done"
                            ? "Done"
                            : task.status === "in-progress"
                            ? "In Progress"
                            : "To Do"}
                        </span>
                      </span>

                      {/* Hover view */}
                      <span className="hidden group-hover/status:flex items-center gap-1.5 font-bold whitespace-nowrap">
                        {task.status === "done" ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                            <span>Return to previous status</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Mark as completed</span>
                          </>
                        )}
                      </span>
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="border border-r-0 border-white/10 px-4 py-3.5">
                    <div className="font-bold text-white group-hover:text-violet-300 transition">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {task.description}
                      </div>
                    )}
                  </td>

                  {/* Project */}
                  <td className="border border-r-0 border-white/10 px-4 py-3.5 text-xs text-slate-300">
                    <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1">
                      {task.project || "General"}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="border border-r-0 border-white/10 px-4 py-3.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDueDate(task.dueDate)}
                    </div>
                  </td>

                  {/* Priority Badge */}
                  <td className="border border-r-0 border-white/10 px-4 py-3.5">
                    {task.priority === "high" && (
                      <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300 border border-rose-500/20">
                        High
                      </span>
                    )}
                    {task.priority === "medium" && (
                      <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/20">
                        Medium
                      </span>
                    )}
                    {task.priority === "low" && (
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/20">
                        Low
                      </span>
                    )}
                  </td>

                  {/* Progress Bar & Checklist Info */}
                  <td className="border border-r-0 border-white/10 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progress === 100
                              ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                              : "bg-gradient-to-r from-violet-500 to-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{progress}%</span>
                    </div>
                    {task.checklist && task.checklist.length > 0 && (
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <CheckSquare className="h-2.5 w-2.5" />
                        {task.checklist.filter((i) => i.completed).length}/{task.checklist.length} items
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="rounded-r-2xl border border-white/10 px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                        title="View details & checklist"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                        title="Edit task"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, task._id, task.title)}
                        disabled={isDeleting}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
