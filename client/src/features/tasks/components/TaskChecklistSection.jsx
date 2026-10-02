import { useState } from "react";
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useChecklist } from "../hooks/useChecklist";
import { Spinner } from "../../../ui/Spinner";

export function TaskChecklistSection({ taskId, checklist = [] }) {
  const [newText, setNewText] = useState("");
  const { addItem, isAdding, toggleItem, deleteItem } = useChecklist(taskId);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addItem(newText.trim(), {
      onSuccess: () => setNewText(""),
    });
  };

  const completedCount = checklist.filter((i) => i.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-violet-400" />
          Checklist ({completedCount}/{checklist.length})
        </h2>
      </div>

      <div className="space-y-2.5">
        {checklist.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-sm hover:bg-white/[0.08] transition group"
          >
            <button
              onClick={() => toggleItem({ itemId: item._id, completed: !item.completed })}
              className="flex items-center gap-3 text-left flex-1"
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-400/20 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-slate-500 hover:text-slate-300 shrink-0" />
              )}
              <span
                className={`text-sm transition ${
                  item.completed ? "line-through text-slate-500" : "text-slate-200"
                }`}
              >
                {item.text}
              </span>
            </button>

            <button
              onClick={() => deleteItem(item._id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add item input */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add new checklist item..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
          />
          <button
            type="submit"
            disabled={isAdding || !newText.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 px-4 py-2.5 text-xs font-bold text-violet-200 transition disabled:opacity-40"
          >
            {isAdding ? <Spinner className="w-3.5 h-3.5 text-violet-200" text="" /> : <Plus className="h-3.5 w-3.5" />}
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
