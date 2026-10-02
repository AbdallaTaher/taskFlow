import { Link } from "react-router-dom";
import {
  Calendar,
  CalendarRange,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { Spinner } from "../../../ui/Spinner";

export function TodayTasksSection({ onNewTask, initialTodayTasks }) {
  const { tasks: fetchedTodayTasks = [], isLoading } = useTasks({ dueDate: "today" });
  const { tasks: allTasks = [] } = useTasks();
  const { updateTask } = useUpdateTask();

  const todayTasks =
    fetchedTodayTasks.length > 0 ? fetchedTodayTasks : initialTodayTasks || [];

  const completedTodayCount = todayTasks.filter((t) => t.status === "done").length;
  const todayProgress =
    todayTasks.length > 0
      ? Math.round((completedTodayCount / todayTasks.length) * 100)
      : 0;

  // Determine if there is large empty space (fewer than 3 tasks due today)
  const hasLargeEmptySpace = todayTasks.length < 3;

  // Gather upcoming deadlines and next active priority tasks to occupy space if needed
  const upcomingTasks = allTasks
    .filter((t) => {
      if (t.status === "done") return false;
      // Do not duplicate tasks already rendered in today's tasks
      if (todayTasks.some((todayT) => todayT._id === t._id)) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      if (a.priority === "high") return -1;
      return 1;
    })
    .slice(0, 3);

  const formatDueDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((checkDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Overdue";
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleToggle = (task) => {
    if (task.status === "done") {
      updateTask({
        id: task._id,
        taskData: {
          status: task.previousStatus || "todo",
          previousStatus: null,
        },
      });
    } else {
      updateTask({
        id: task._id,
        taskData: {
          status: "done",
          previousStatus: task.status,
        },
      });
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d1627]/90 p-6 shadow-xl backdrop-blur-md h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Today's Tasks</h3>
                <span className="rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold px-2 py-0.5 border border-violet-500/30">
                  {todayTasks.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">Items scheduled for today</p>
            </div>
          </div>

          <Link
            to="/tasks"
            className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Daily Completion Meter (shown if there are tasks for today) */}
        {todayTasks.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Daily Goal Progress</span>
              <span className="font-bold text-emerald-400">
                {completedTodayCount} of {todayTasks.length} done ({todayProgress}%)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${todayProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Content: Tasks or Clean Slate */}
        {isLoading ? (
          <div className="py-10 text-center">
            <Spinner className="w-6 h-6 text-violet-500 mx-auto" text="Loading today's schedule..." />
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-center">
            <Sparkles className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">All caught up for today!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No pending deadlines scheduled for today.
            </p>
            {onNewTask && (
              <button
                onClick={onNewTask}
                className="mt-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition cursor-pointer"
              >
                + Schedule a task for today
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1.5 scrollbar-thin">
            {todayTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 hover:bg-white/[0.08] transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <button
                    onClick={() => handleToggle(task)}
                    className="p-0.5 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>
                  <div className="truncate">
                    <span
                      className={`text-xs font-semibold truncate block ${
                        task.status === "done" ? "line-through text-slate-500" : "text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                    <div className="text-[10px] text-slate-400">{task.project || "General"}</div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === "high"
                      ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      : task.priority === "medium"
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Space Occupier: ONLY rendered if there is large empty space (todayTasks.length < 3) */}
        {hasLargeEmptySpace && upcomingTasks.length > 0 && (
          <div className="pt-3.5 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <CalendarRange className="h-3.5 w-3.5 text-violet-400" />
                <span>Upcoming On Your Radar</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Next Deadlines & Priorities</span>
            </div>

            <div className="space-y-2">
              {upcomingTasks.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 hover:bg-white/[0.06] transition text-xs group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <button
                      onClick={() => handleToggle(t)}
                      className="p-0.5 text-slate-500 hover:text-white transition cursor-pointer"
                    >
                      <Circle className="h-4 w-4" />
                    </button>
                    <div className="truncate">
                      <span className="font-semibold text-slate-200 group-hover:text-white transition truncate block">
                        {t.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDueDate(t.dueDate)} • {t.project || "General"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      t.priority === "high"
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        : t.priority === "medium"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Symmetrical Footer matching Recent Activity */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 mt-4">
        <span>Daily workload tracking</span>
        <span className="text-emerald-400 font-semibold">
          {todayTasks.length === 0 ? "Clean schedule" : `${completedTodayCount}/${todayTasks.length} finished`}
        </span>
      </div>
    </div>
  );
}
