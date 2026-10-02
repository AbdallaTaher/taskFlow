import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

export function Spinner({ className = "w-5 h-5", text }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className={cn("animate-spin text-brand-500", className)} />
      {text && <span className="text-sm text-slate-400">{text}</span>}
    </div>
  );
}
