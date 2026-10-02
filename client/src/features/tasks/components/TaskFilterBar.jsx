import { Search, X, RotateCcw } from "lucide-react";

export function TaskFilterBar({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  sort,
  setSort,
  onReset,
}) {
  const hasActiveFilters = Boolean(
    search || (status && status !== "all") || (priority && priority !== "all") || sort !== "-createdAt"
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1525]/90 p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, project, or description..."
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-9 py-2 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0b1220] text-slate-200">All</option>
              <option value="todo" className="bg-[#0b1220] text-slate-200">To Do</option>
              <option value="in-progress" className="bg-[#0b1220] text-slate-200">In Progress</option>
              <option value="done" className="bg-[#0b1220] text-slate-200">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5">
            <span className="text-xs text-slate-400">Priority:</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0b1220] text-slate-200">All</option>
              <option value="low" className="bg-[#0b1220] text-slate-200">Low</option>
              <option value="medium" className="bg-[#0b1220] text-slate-200">Medium</option>
              <option value="high" className="bg-[#0b1220] text-slate-200">High</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="-createdAt" className="bg-[#0b1220] text-slate-200">Newest First</option>
              <option value="createdAt" className="bg-[#0b1220] text-slate-200">Oldest First</option>
              <option value="dueDate" className="bg-[#0b1220] text-slate-200">Due Date (Earliest)</option>
              <option value="title" className="bg-[#0b1220] text-slate-200">Title (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
