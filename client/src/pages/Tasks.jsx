import { useState, useMemo } from "react";
import { Plus, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { useTasks } from "../features/tasks/hooks/useTasks";
import { TaskFilterBar } from "../features/tasks/components/TaskFilterBar";
import { TaskTable } from "../features/tasks/components/TaskTable";
import { TaskModal } from "../features/tasks/components/TaskModal";

export default function Tasks() {

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("-createdAt");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const queryFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status !== "all" ? status : undefined,
      priority: priority !== "all" ? priority : undefined,
      sort,
    }),
    [search, status, priority, sort]
  );

  const { tasks, isLoading } = useTasks(queryFilters);

  // Compute comprehensive metrics from current tasks list
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;

    const highPriority = tasks.filter((t) => t.priority === "high").length;
    const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
    const lowPriority = tasks.filter((t) => t.priority === "low").length;

    const highCompleted = tasks.filter((t) => t.status === "done" && t.priority === "high").length;
    const highInProgress = tasks.filter((t) => t.status === "in-progress" && t.priority === "high").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter((t) => {
      if (t.status === "done" || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;

    const projectsCount = new Set(tasks.map((t) => t.project || "General")).size;

    return {
      total,
      completed,
      inProgress,
      todo,
      completionRate,
      inProgressRate,
      highPriority,
      mediumPriority,
      lowPriority,
      highCompleted,
      highInProgress,
      overdue,
      projectsCount,
    };
  }, [tasks]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setSort("-createdAt");
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Task Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create, organize, filter, and track your work progress in real-time.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Completed */}
          <div className="relative overflow-hidden rounded-3xl p-5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-200/90 shadow-[0_10px_25px_rgba(16,185,129,0.08)] dark:from-[#09261d]/85 dark:via-[#0c1f19]/90 dark:to-[#071512] dark:border-emerald-500/30 dark:shadow-[0_14px_35px_rgba(5,150,105,0.18)]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/20 dark:bg-emerald-500/15 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  Completed Tasks
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 dark:bg-emerald-500/20 px-2.5 py-0.5 font-black text-emerald-700 dark:text-emerald-300 text-xs shadow-sm shadow-emerald-500/10">
                  {metrics.completionRate}%
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{metrics.completed}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">of {metrics.total} finished</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-emerald-100 dark:bg-white/10 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30 transition-all duration-500"
                  style={{ width: `${metrics.completionRate}%` }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-emerald-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>High priority done: <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{metrics.highCompleted}</strong></span>
              <span>Remaining: <strong className="text-slate-800 dark:text-slate-200 font-bold">{metrics.todo + metrics.inProgress}</strong></span>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className="relative overflow-hidden rounded-3xl p-5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border bg-gradient-to-br from-amber-50 via-orange-50/40 to-white border-amber-200/90 shadow-[0_10px_25px_rgba(245,158,11,0.08)] dark:from-[#2e1d09]/85 dark:via-[#1f1508]/90 dark:to-[#120d04] dark:border-amber-500/30 dark:shadow-[0_14px_35px_rgba(217,119,6,0.18)]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-400/20 dark:bg-amber-500/15 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10">
                    <Clock className="h-4 w-4" />
                  </span>
                  In Progress
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/15 dark:bg-amber-500/20 px-2.5 py-0.5 font-black text-amber-700 dark:text-amber-300 text-xs shadow-sm shadow-amber-500/10">
                  {metrics.inProgressRate}% active
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{metrics.inProgress}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">tasks underway</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-amber-100 dark:bg-white/10 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-sm shadow-amber-500/30 transition-all duration-500"
                  style={{ width: `${metrics.inProgressRate}%` }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-amber-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>High priority active: <strong className="text-amber-700 dark:text-amber-300 font-bold">{metrics.highInProgress}</strong></span>
              <span>Overdue: <strong className={metrics.overdue > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-700 dark:text-slate-300"}>{metrics.overdue}</strong></span>
            </div>
          </div>

          {/* Card 3: Total Workspace Tasks */}
          <div className="relative overflow-hidden rounded-3xl p-5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border bg-gradient-to-br from-violet-50 via-indigo-50/40 to-white border-violet-200/90 shadow-[0_10px_25px_rgba(139,92,246,0.08)] dark:from-[#1d143c]/85 dark:via-[#140f2a]/90 dark:to-[#0b0818] dark:border-violet-500/30 dark:shadow-[0_14px_35px_rgba(139,92,246,0.18)]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-400/20 dark:bg-violet-500/15 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 shadow-sm shadow-violet-500/10">
                    <ListChecks className="h-4 w-4" />
                  </span>
                  Total Tasks
                </span>
                <span className="rounded-full border border-violet-500/30 bg-violet-500/15 dark:bg-violet-500/20 px-2.5 py-0.5 font-black text-violet-700 dark:text-violet-300 text-xs shadow-sm shadow-violet-500/10">
                  {metrics.projectsCount} {metrics.projectsCount === 1 ? "Project" : "Projects"}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{metrics.total}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{metrics.todo} waiting in To Do</span>
              </div>
              {/* Multi-segment stacked progress bar */}
              <div className="h-2 w-full rounded-full bg-violet-100 dark:bg-white/10 mt-3 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0}%` }}
                  title="Completed"
                />
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${metrics.total > 0 ? (metrics.inProgress / metrics.total) * 100 : 0}%` }}
                  title="In Progress"
                />
                <div
                  className="h-full bg-violet-500 transition-all"
                  style={{ width: `${metrics.total > 0 ? (metrics.todo / metrics.total) * 100 : 0}%` }}
                  title="To Do"
                />
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-violet-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>Priority: <strong className="text-rose-600 dark:text-rose-300 font-bold">{metrics.highPriority}H</strong> · <strong className="text-amber-600 dark:text-amber-300 font-bold">{metrics.mediumPriority}M</strong> · <strong className="text-emerald-600 dark:text-emerald-300 font-bold">{metrics.lowPriority}L</strong></span>
              <span>Backlog: <strong className="text-slate-800 dark:text-slate-200 font-bold">{metrics.todo}</strong></span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <TaskFilterBar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          sort={sort}
          setSort={setSort}
          onReset={handleResetFilters}
        />

        {/* Tasks Table */}
        <TaskTable
          tasks={tasks}
          isLoading={isLoading}
          onEditTask={handleOpenEditModal}
          onNewTask={handleOpenCreateModal}
        />

      {/* Create / Edit Modal Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
