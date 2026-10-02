import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ListChecks,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Activity,
  BarChart3,
  Calendar,
  Zap,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { useUser } from "../features/auth/hooks/useUser";
import { useDashboardStats } from "../features/tasks/hooks/useDashboardStats";
import { TodayTasksSection } from "../features/tasks/components/TodayTasksSection";
import { TaskModal } from "../features/tasks/components/TaskModal";
import { Spinner } from "../ui/Spinner";

export default function Dashboard() {
  const { user } = useUser();
  const { stats, isLoading: isStatsLoading } = useDashboardStats();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Defaults
  const total = stats?.totalTasks || 0;
  const completed = stats?.completedTasks || 0;
  const inProgress = stats?.inProgressTasks || 0;
  const todo = stats?.todoTasks || 0;
  const overdue = stats?.overdueTasks || 0;
  const dueToday = stats?.dueTodayTasks || 0;
  const focusScore = stats?.focusScore !== undefined ? stats.focusScore : 100;
  const priority = stats?.priority || { high: 0, medium: 0, low: 0 };
  const recentActivities = stats?.recentActivity || [];

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const todoRate = total > 0 ? Math.round((todo / total) * 100) : 0;

  // Format today's date
  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Rapid conclusions computation
  const getVelocityConclusion = () => {
    if (total === 0) return "You currently have no tasks in your workspace. Start by creating a task!";
    if (completionRate >= 75) return `Outstanding execution! ${completionRate}% of your total workload is completed with high momentum.`;
    if (completionRate >= 40) return `Steady progress: ${completionRate}% completed (${completed} of ${total}). Focus on active in-progress tasks to cross the finish line.`;
    return `Early stage: ${completed} of ${total} tasks finished (${completionRate}%). Prioritize high-impact items to build momentum.`;
  };

  const getPriorityConclusion = () => {
    if (priority.high === 0) return "No critical high-priority bottlenecks detected. Your schedule is well balanced.";
    if (overdue > 0) return `Warning: ${priority.high} high-priority tasks and ${overdue} overdue tasks need immediate intervention.`;
    return `You have ${priority.high} high-priority tasks in progress. Keep them prioritized to avoid deadline pressure.`;
  };

  const getActionRecommendation = () => {
    if (overdue > 0) return "Urgent Action: Clear or reschedule the overdue task(s) first to recover your focus health.";
    if (dueToday > 0) return `Today's Goal: Complete the ${dueToday} task(s) scheduled for today before opening new work.`;
    if (inProgress > 0) return `Focus: Finish the ${inProgress} in-progress task(s) to convert them into completed milestones.`;
    if (todo > 0) return "Ready to start: Pick your top priority item from the 'To Do' queue.";
    return "All tasks completed! Enjoy a clean slate or plan your next sprint.";
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      {/* Welcome Banner with Enriched Information & Clear Focus Health */}
        <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#101b2f] via-[#0d1627] to-[#141b33] p-7 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"></div>

          {/* Left Welcome Details */}
          <div className="relative z-10 max-w-2xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                <Calendar className="h-3.5 w-3.5 text-violet-400" /> {formattedToday}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                <Zap className="h-3.5 w-3.5 text-emerald-400" /> Live Synchronized
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                Here is your real-time operational overview. You have{" "}
                <strong className="text-white font-bold">{dueToday}</strong> task(s) scheduled for today,{" "}
                <strong className="text-amber-300 font-bold">{inProgress}</strong> currently in momentum, and{" "}
                <strong className="text-rose-300 font-bold">{overdue}</strong> requiring immediate review.
              </p>
            </div>

            {/* Quick Stats Summary Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-400"></span>
                <span>Total Workload: <strong className="text-white font-bold">{total}</strong></span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Completion: <strong className="text-white font-bold">{completionRate}%</strong></span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>High Priority: <strong className="text-white font-bold">{priority.high}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create New Task
              </button>
              <Link
                to="/tasks"
                className="group flex items-center gap-2 rounded-xl border-2 border-violet-400/80 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 shadow-md shadow-violet-500/10 hover:border-violet-500 hover:bg-violet-100 hover:text-violet-900 dark:border-violet-400/40 dark:bg-violet-500/20 dark:text-white dark:hover:border-violet-300 dark:hover:bg-violet-500/30 dark:shadow-violet-500/20 transition-all duration-200 cursor-pointer"
              >
                <span>Open Full Table</span>
                <ArrowRight className="h-4 w-4 text-violet-600 dark:text-violet-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: Productivity & Workload Health (Focus Score) Card */}
          <div className="relative z-10 w-full lg:w-80 rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Productivity Health
                  </div>
                  <div className="text-[10px] text-slate-400">Focus & Velocity Score</div>
                </div>
              </div>

              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                  focusScore >= 80
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : focusScore >= 50
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                }`}
              >
                {focusScore >= 80 ? "Optimal (80+)" : focusScore >= 50 ? "Steady (50+)" : "Needs Action"}
              </span>
            </div>

            {/* Score & Visual Gauge */}
            <div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-black text-white">
                  {focusScore} <span className="text-base font-semibold text-slate-400">/ 100</span>
                </div>
                <span className="text-xs font-bold text-violet-300">
                  {completed} Completed / {overdue} Overdue
                </span>
              </div>

              {/* Progress Track */}
              <div className="mt-2 h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    focusScore >= 80
                      ? "bg-gradient-to-r from-violet-500 via-indigo-400 to-emerald-400"
                      : focusScore >= 50
                      ? "bg-gradient-to-r from-amber-500 to-orange-400"
                      : "bg-gradient-to-r from-rose-500 to-amber-500"
                  }`}
                  style={{ width: `${focusScore}%` }}
                ></div>
              </div>
            </div>

            {/* Plain English Explanation */}
            <div className="rounded-xl bg-black/20 border border-white/5 p-3 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-semibold text-white block mb-0.5">Health Summary:</span>
              {focusScore >= 80
                ? "Excellent! High ratio of finished work and zero critical overdue bottlenecks."
                : focusScore >= 50
                ? "Solid velocity. Wrap up active in-progress tasks to reach the top tier."
                : "Attention required: Overdue or delayed tasks are impacting your velocity score."}
            </div>
          </div>
        </div>

        {/* 4 Enriched Stat Cards (Filling Box Space with Valuable Context) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tasks */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1627]/80 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-white/20 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Tasks
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <ListChecks className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-black text-white">
                {isStatsLoading ? <Spinner className="w-5 h-5 text-violet-400" text="" /> : total}
              </div>
            </div>

            {/* Sub-breakdown Data */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-slate-400">Active Load:</span>
                <span className="font-bold text-violet-300">{todo + inProgress} remaining</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden flex">
                <div className="bg-emerald-400 h-full" style={{ width: `${completionRate}%` }}></div>
                <div className="bg-amber-400 h-full" style={{ width: `${inProgressRate}%` }}></div>
                <div className="bg-slate-500 h-full" style={{ width: `${todoRate}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{todo} to-do</span>
                <span>{inProgress} active</span>
                <span>{completed} done</span>
              </div>
            </div>
          </div>

          {/* Card 2: Completed Tasks */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1627]/80 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-white/20 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Completed
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-black text-emerald-400">
                {isStatsLoading ? <Spinner className="w-5 h-5 text-emerald-400" text="" /> : completed}
              </div>
            </div>

            {/* Sub-breakdown Data */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Completion Rate:</span>
                <span className="font-bold text-emerald-300">{completionRate}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{total - completed} tasks left</span>
                <span className="text-emerald-400 font-semibold">
                  {completed > 0 ? "Momentum steady" : "Awaiting finishes"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1627]/80 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-white/20 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  In Progress
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-black text-amber-400">
                {isStatsLoading ? <Spinner className="w-5 h-5 text-amber-400" text="" /> : inProgress}
              </div>
            </div>

            {/* Sub-breakdown Data */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Workload State:</span>
                <span className="font-bold text-amber-300">
                  {inProgress > 3 ? "Heavy concurrency" : inProgress > 0 ? "Focused momentum" : "Idle"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                  {priority.high} High
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  {priority.medium} Med
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  {priority.low} Low
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                {inProgress > 0 ? "Currently being worked on" : "Move items from To-Do to start"}
              </div>
            </div>
          </div>

          {/* Card 4: Overdue Tasks */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1627]/80 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-white/20 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Overdue Tasks
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${overdue > 0 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  {overdue > 0 ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                </div>
              </div>
              <div className={`mt-2 text-3xl font-black ${overdue > 0 ? "text-rose-400" : "text-white"}`}>
                {isStatsLoading ? <Spinner className="w-5 h-5 text-rose-400" text="" /> : overdue}
              </div>
            </div>

            {/* Sub-breakdown Data */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Timeline Health:</span>
                <span className={`font-bold ${overdue > 0 ? "text-rose-300" : "text-emerald-300"}`}>
                  {overdue > 0 ? "Deadlines breached" : "All on schedule"}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {overdue > 0 ? (
                  <span className="text-rose-300 font-semibold">
                    ⚠️ {overdue} task(s) need immediate rescheduling or completion.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    ✨ Zero missed deadlines across your workspace.
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Due today: {dueToday}</span>
                <span className="text-slate-500 font-medium">Auto-tracked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Chart & Rapid Conclusions Section (Requirement 4) */}
        <div className="rounded-3xl border border-white/10 bg-[#0d1627]/90 p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-black text-white">Work Analytics & Rapid Conclusions</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive conclusions generated automatically from your current workload data
              </p>
            </div>

            <Link
              to="/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
            >
              View detailed task table <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Charts: Left (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Status Ratio Bar & Donut representation */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-400" /> Status Distribution
                  </span>
                  <span className="text-slate-400">{total} Tasks Tracked</span>
                </div>

                {/* Multi-segment Colored Bar */}
                <div className="h-4 rounded-xl bg-white/5 overflow-hidden flex shadow-inner">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                    title={`Done: ${completed} (${completionRate}%)`}
                  ></div>
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${inProgressRate}%` }}
                    title={`In Progress: ${inProgress} (${inProgressRate}%)`}
                  ></div>
                  <div
                    className="bg-slate-500 h-full transition-all duration-500"
                    style={{ width: `${todoRate}%` }}
                    title={`To Do: ${todo} (${todoRate}%)`}
                  ></div>
                </div>

                {/* Legend with direct percentages */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Completed
                    </div>
                    <div className="text-lg font-black text-white mt-1">{completed}</div>
                    <div className="text-[10px] text-slate-400">{completionRate}% of total</div>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-amber-400"></span> In Progress
                    </div>
                    <div className="text-lg font-black text-white mt-1">{inProgress}</div>
                    <div className="text-[10px] text-slate-400">{inProgressRate}% of total</div>
                  </div>

                  <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-slate-400"></span> To Do
                    </div>
                    <div className="text-lg font-black text-white mt-1">{todo}</div>
                    <div className="text-[10px] text-slate-400">{todoRate}% of total</div>
                  </div>
                </div>
              </div>

              {/* Priority Load Distribution */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-violet-400" /> Priority Breakdown
                  </span>
                  <span className="text-[10px] text-slate-400">Urgency allocation</span>
                </div>

                <div className="space-y-2.5">
                  {/* High Priority Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5 font-bold text-rose-300">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span> High Priority
                      </span>
                      <span className="font-bold text-white">{priority.high} tasks</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${total > 0 ? (priority.high / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Medium Priority Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5 font-bold text-amber-300">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span> Medium Priority
                      </span>
                      <span className="font-bold text-white">{priority.medium} tasks</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${total > 0 ? (priority.medium / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Low Priority Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Low Priority
                      </span>
                      <span className="font-bold text-white">{priority.low} tasks</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${total > 0 ? (priority.low / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rapid Conclusions Box: Right (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-[#0d1627] to-blue-950/20 p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-violet-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <TrendingUp className="h-4 w-4" /> Rapid Conclusions & Insights
                </div>

                <div className="space-y-3.5">
                  {/* Insight 1: Velocity */}
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-emerald-400">●</span> Delivery Velocity
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {getVelocityConclusion()}
                    </p>
                  </div>

                  {/* Insight 2: Urgency */}
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-amber-400">●</span> Urgency & Deadlines
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {getPriorityConclusion()}
                    </p>
                  </div>

                  {/* Insight 3: Recommended Action */}
                  <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-xs space-y-1">
                    <span className="font-bold text-violet-200 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-violet-300" /> Recommended Action
                    </span>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {getActionRecommendation()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Calculated dynamically</span>
                <span className="text-emerald-400 font-semibold">Real-time update</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid: Perfectly Balanced 2-Column Split (Zero Unused Space) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Today's Tasks & Priority Queue */}
          <div className="h-full">
            <TodayTasksSection
              onNewTask={() => setIsTaskModalOpen(true)}
              initialTodayTasks={stats?.todayTasks}
            />
          </div>

          {/* Right Column: Scrollable Recent Activity Feed */}
          <div className="rounded-3xl border border-white/10 bg-[#0d1627]/90 p-6 shadow-xl backdrop-blur-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Recent Activity</h3>
                      <span className="rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold px-2 py-0.5 border border-violet-500/30">
                        {recentActivities.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Latest task actions and updates</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Stream
                </span>
              </div>

              {recentActivities.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 rounded-2xl border border-dashed border-white/10 p-6">
                  <Activity className="h-6 w-6 text-slate-500 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-slate-300 text-xs">No recent activity recorded yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    When you update tasks, checklist items, or toggle statuses, activities will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {recentActivities.map((act) => (
                    <div
                      key={act._id}
                      className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs space-y-1 hover:bg-white/[0.08] transition"
                    >
                      <div className="font-semibold text-white truncate">{act.taskTitle}</div>
                      <div className="text-slate-300 text-[11px] leading-snug">{act.text}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {new Date(act.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 mt-4">
              <span>Showing last {recentActivities.length} updates</span>
              <span className="text-violet-400 font-semibold">Auto-synchronized</span>
            </div>
          </div>
        </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}
