import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { X, Plus, Trash2, CheckSquare, AlertTriangle } from "lucide-react";
import { useCreateTask } from "../hooks/useCreateTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { Spinner } from "../../../ui/Spinner";

export function TaskModal({ isOpen, onClose, taskToEdit = null }) {
  const isEditMode = Boolean(taskToEdit);
  const { createTask, isCreating } = useCreateTask();
  const { updateTask, isUpdating } = useUpdateTask();

  const isSubmitting = isCreating || isUpdating;

  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const [newChecklistText, setNewChecklistText] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      project: "General",
      priority: "medium",
      status: "todo",
      dueDate: "",
      checklist: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "checklist",
  });

  const watchedDueDate = watch("dueDate");
  const watchedChecklist = watch("checklist") || [];
  const watchedStatus = watch("status");

  useEffect(() => {
    if (taskToEdit) {
      reset({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        project: taskToEdit.project || "General",
        priority: taskToEdit.priority || "medium",
        status: taskToEdit.status || "todo",
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split("T")[0] : "",
        checklist: taskToEdit.checklist || [],
      });
    } else {
      reset({
        title: "",
        description: "",
        project: "General",
        priority: "medium",
        status: "todo",
        dueDate: "",
        checklist: [],
      });
    }
    setPendingSubmitData(null);
    setNewChecklistText("");
  }, [taskToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const isDateInPast = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(dateStr);
    chosen.setHours(0, 0, 0, 0);
    return chosen < today;
  };

  const isPastDue = isDateInPast(watchedDueDate);

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    append({ text: newChecklistText.trim(), completed: false });
    setNewChecklistText("");
  };

  const handleToggleChecklistItem = (index) => {
    const currentVal = Boolean(watchedChecklist[index]?.completed);
    const nextVal = !currentVal;
    setValue(`checklist.${index}.completed`, nextVal, { shouldDirty: true });

    // Auto-advance status from "todo" to "in-progress" when any item is checked
    if (nextVal && getValues("status") === "todo") {
      setValue("status", "in-progress", { shouldDirty: true });
    }
  };

  const executeSubmit = (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      project: data.project,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      checklist: data.checklist || [],
    };

    if (isEditMode) {
      updateTask(
        { id: taskToEdit._id, taskData: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createTask(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const onSubmit = (data) => {
    // Check if the user selected a past due date and prompt for confirmation
    if (isDateInPast(data.dueDate)) {
      setPendingSubmitData(data);
      return;
    }
    executeSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] rounded-3xl border border-white/10 bg-[#0d1525] shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Past Date Confirmation Overlay */}
        {pendingSubmitData && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md rounded-3xl animate-fadeIn">
            <div className="rounded-2xl border border-amber-500/30 bg-[#0d1525] p-6 text-center max-w-sm shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-3">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white">Due Date Has Passed</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                The date you selected (<strong className="text-amber-300">{pendingSubmitData.dueDate}</strong>) is earlier than today. Are you sure you want to save this task with an overdue date?
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingSubmitData(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                >
                  Change Date
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const data = pendingSubmitData;
                    setPendingSubmitData(null);
                    executeSubmit(data);
                  }}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition"
                >
                  Yes, Keep Date
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0 bg-[#0d1525]">
          <div>
            <h2 className="text-xl font-black text-white">
              {isEditMode ? "Task Details & Checklist" : "Create New Task"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditMode ? "Update details, checklist, and status of this task" : "Add a new task to your workspace"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Redesign Landing Page"
                {...register("title", {
                  required: "Task title is required",
                  maxLength: { value: 120, message: "Max 120 characters" },
                })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Project & Due Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Project / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design, Sprint 1"
                  {...register("project")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register("dueDate")}
                    className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 transition ${
                      isPastDue
                        ? "border-amber-500/50 focus:border-amber-400 focus:ring-amber-400"
                        : "border-white/10 focus:border-violet-500 focus:ring-violet-500"
                    }`}
                  />
                </div>
                {isPastDue && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>This date has passed (task will be marked overdue).</span>
                  </div>
                )}
              </div>
            </div>

            {/* Priority & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Priority
                </label>
                <select
                  {...register("priority")}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition cursor-pointer"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Status
                  </label>
                  {watchedStatus === "in-progress" && (
                    <span className="text-[10px] text-amber-400 font-bold">In Progress</span>
                  )}
                </div>
                <select
                  {...register("status")}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition cursor-pointer"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed (Done)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Add details, notes, or acceptance criteria..."
                {...register("description", {
                  maxLength: { value: 2000, message: "Max 2000 characters" },
                })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Checklist Section */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-violet-400" />
                  Checklist Items ({fields.length})
                </span>
                <span className="text-[10px] text-slate-400">
                  Checking an item automatically moves task to In Progress
                </span>
              </div>

              {/* Existing Checklist Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {fields.map((item, index) => {
                  const isChecked = Boolean(watchedChecklist[index]?.completed);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2.5 rounded-xl bg-white/5 px-3 py-2 text-xs hover:bg-white/[0.08] transition"
                    >
                      <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleChecklistItem(index)}
                          className="h-4 w-4 rounded border-white/20 bg-white/10 text-violet-600 focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-xs transition ${isChecked ? "line-through text-slate-400" : "text-slate-200"}`}>
                          {item.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-red-400 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Checklist Item input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Add checklist item..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer: ALWAYS visible */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#0d1525] shrink-0">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isEditMode ? "Click Save Changes to apply all updates" : "Fill required fields to create task"}
            </span>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Spinner className="w-3.5 h-3.5 text-white" text="" />
                ) : null}
                {isEditMode ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
