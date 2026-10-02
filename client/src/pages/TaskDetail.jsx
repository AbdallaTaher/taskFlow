import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  Edit3,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useTask } from "../features/tasks/hooks/useTask";
import { useTasks } from "../features/tasks/hooks/useTasks";
import { useUpdateTask } from "../features/tasks/hooks/useUpdateTask";
import { useDeleteTask } from "../features/tasks/hooks/useDeleteTask";
import { TaskChecklistSection } from "../features/tasks/components/TaskChecklistSection";
import { TaskActivityPanel } from "../features/tasks/components/TaskActivityPanel";
import { TaskModal } from "../features/tasks/components/TaskModal";
import { getAvatarUrl } from "../utils/avatar";
import { Spinner } from "../ui/Spinner";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { task, isLoading, isError } = useTask(id);
  const { tasks: queueTasks = [] } = useTasks({ project: task?.project });
  const { updateTask, isUpdating } = useUpdateTask();
  const { deleteTask, isDeleting } = useDeleteTask();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full py-24 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-violet-500" text="Loading task details..." />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 ring-1 ring-rose-500/20">
          <Trash2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Task Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          The requested task might have been deleted, or you don't have permission to access it.
        </p>
        <Link
          to="/tasks"
          className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500 transition"
        >
          Back to Tasks
        </Link>
      </div>
    );
  }

  const checklist = task.checklist || [];
  const completedCount = checklist.filter((i) => i.completed).length;

  const calculateProgress = () => {
    if (task.status === "done") return 100;
    if (checklist.length > 0) {
      return Math.round((completedCount / checklist.length) * 100);
    }
    if (task.status === "in-progress") return 50;
    return 0;
  };

  const progress = calculateProgress();

  const handleToggleStatus = () => {
    if (task.status === "done") {
      const restoredStatus =
        task.previousStatus ||
        (checklist.some((i) => i.completed) ? "in-progress" : "todo");
      updateTask({
        id: task._id,
        taskData: { status: restoredStatus, previousStatus: null },
      });
    } else {
      updateTask({
        id: task._id,
        taskData: { status: "done", previousStatus: task.status },
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task._id, {
        onSuccess: () => navigate("/tasks"),
      });
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const otherQueueTasks = queueTasks.filter((t) => t._id !== task._id).slice(0, 3);

  return (
    <div className="w-full flex-1 text-slate-200">
      {/* Background radial gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-10 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"></div>
        <div className="absolute right-[-12%] bottom-0 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                Task Detail
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{task.project || "General"}</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/tasks"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to tasks
            </Link>
          </div>
        </div>

        {/* Main Grid: Left Details & Right Activity/Actions */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left Column: Details, Progress, Metadata & Checklist */}
          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-[#0d1525]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
              {/* Project & Priority Banner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-200">
                    <CalendarRange className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Project / Category</div>
                    <div className="font-bold text-white text-base">{task.project || "General"}</div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    task.priority === "high"
                      ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      : task.priority === "medium"
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  }`}
                >
                  {task.priority} Priority
                </span>
              </div>

              {/* Progress Card */}
              <div className="rounded-[24px] bg-gradient-to-br from-violet-500/10 via-[#0d1525] to-blue-500/5 p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Overall Progress
                  </span>
                  <span className="text-xs font-black text-violet-200">{progress}%</span>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progress === 100
                        ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                        : "bg-gradient-to-r from-violet-500 to-blue-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                    Description
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Metadata Cards Grid */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Due Date</div>
                  <div className="mt-1 font-bold text-white text-sm">{formatDueDate(task.dueDate)}</div>
                </div>

                <div className="rounded-2xl bg-violet-500/5 p-4 ring-1 ring-white/5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Owner</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[10px] flex items-center justify-center overflow-hidden">
                      {getAvatarUrl(task.owner?.photo) ? (
                        <img src={getAvatarUrl(task.owner.photo)} alt="" className="h-full w-full object-cover" />
                      ) : task.owner?.name ? (
                        task.owner.name[0].toUpperCase()
                      ) : (
                        "U"
                      )}
                    </div>
                    <span className="font-bold text-white text-sm truncate">
                      {task.owner?.name || "User"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-500/5 p-4 ring-1 ring-white/5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</div>
                  <div className="mt-1 font-bold text-white text-sm capitalize">
                    {task.status === "in-progress" ? "In Progress" : task.status}
                  </div>
                </div>
              </div>

              {/* Checklist Section */}
              <TaskChecklistSection taskId={task._id} checklist={task.checklist} />

              {/* Other tasks in this project queue */}
              {otherQueueTasks.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Other tasks in this project
                  </h3>
                  <div className="space-y-2">
                    {otherQueueTasks.map((t) => (
                      <Link
                        key={t._id}
                        to={`/tasks/${t._id}`}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 hover:bg-white/10 transition"
                      >
                        <span className="text-xs font-semibold text-white truncate">{t.title}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            t.status === "done"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-violet-500/10 text-violet-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Activity Log */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="rounded-[30px] border border-white/10 bg-[#0d1525]/90 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="text-lg font-black text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleToggleStatus}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition disabled:opacity-50"
                >
                  {task.status === "done" ? (
                    <>
                      <RotateCcw className="h-4 w-4 text-amber-300" />
                      <span>
                        Return to previous status (
                        {task.previousStatus === "in-progress"
                          ? "In Progress"
                          : "To Do"}
                        )
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Mark as Completed
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-bold text-slate-200 transition"
                >
                  <Edit3 className="h-4 w-4" /> Edit Task Details
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-3 text-xs font-bold text-rose-300 transition disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete Task
                </button>
              </div>
            </div>

            {/* Activity Log Panel */}
            <TaskActivityPanel activity={task.activity} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        taskToEdit={task}
      />
    </div>
  );
}
