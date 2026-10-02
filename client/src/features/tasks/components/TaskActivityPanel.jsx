import { History, Sparkles, CheckCircle2, CheckSquare, Edit3 } from "lucide-react";

export function TaskActivityPanel({ activity = [] }) {
  const sortedActivity = [...activity].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case "created":
        return <Sparkles className="h-3.5 w-3.5 text-violet-400" />;
      case "status_change":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "checklist_update":
        return <CheckSquare className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return <Edit3 className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0d1525]/90 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-5">
        <History className="h-5 w-5 text-violet-400" />
        <h2 className="text-lg font-black text-white">Activity Log</h2>
      </div>

      {sortedActivity.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">No activity recorded yet.</p>
      ) : (
        <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
          {sortedActivity.map((item, index) => (
            <div
              key={item._id || index}
              className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/5 hover:bg-white/[0.08] transition"
            >
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 shrink-0">
                {getActivityIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white leading-snug">{item.text}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  {item.user?.name && (
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      {item.user.name}
                    </span>
                  )}
                  <span>•</span>
                  <span>{formatTime(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
