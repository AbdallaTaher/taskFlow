import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addChecklistItemApi,
  toggleChecklistItemApi,
  deleteChecklistItemApi,
} from "../services/taskApi";

export function useChecklist(taskId) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const { mutate: addItem, isPending: isAdding } = useMutation({
    mutationFn: (text) => addChecklistItemApi(taskId, text),
    onSuccess: () => {
      toast.success("Checklist item added");
      invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add checklist item");
    },
  });

  const { mutate: toggleItem, isPending: isToggling } = useMutation({
    mutationFn: ({ itemId, completed }) =>
      toggleChecklistItemApi(taskId, itemId, completed),
    onMutate: async ({ itemId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["task", taskId] });
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTask = queryClient.getQueryData(["task", taskId]);

      // Optimistically update task detail cache
      queryClient.setQueryData(["task", taskId], (old) => {
        if (!old) return old;
        const updatedChecklist = (old.checklist || []).map((item) =>
          item._id === itemId ? { ...item, completed } : item
        );
        let nextStatus = old.status;
        if (completed && old.status === "todo") {
          nextStatus = "in-progress";
        }
        return {
          ...old,
          status: nextStatus,
          checklist: updatedChecklist,
        };
      });

      // Optimistically update tasks list cache
      queryClient.setQueriesData({ queryKey: ["tasks"] }, (oldTasks) => {
        if (!Array.isArray(oldTasks)) return oldTasks;
        return oldTasks.map((t) => {
          if (t._id !== taskId) return t;
          const updatedChecklist = (t.checklist || []).map((item) =>
            item._id === itemId ? { ...item, completed } : item
          );
          let nextStatus = t.status;
          if (completed && t.status === "todo") {
            nextStatus = "in-progress";
          }
          return {
            ...t,
            status: nextStatus,
            checklist: updatedChecklist,
          };
        });
      });

      return { previousTask };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(["task", taskId], context.previousTask);
      }
      toast.error(err.message || "Failed to toggle checklist item");
    },
    onSettled: () => {
      invalidate();
    },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: (itemId) => deleteChecklistItemApi(taskId, itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["task", taskId] });
      const previousTask = queryClient.getQueryData(["task", taskId]);

      queryClient.setQueryData(["task", taskId], (old) => {
        if (!old) return old;
        return {
          ...old,
          checklist: (old.checklist || []).filter((item) => item._id !== itemId),
        };
      });

      return { previousTask };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(["task", taskId], context.previousTask);
      }
      toast.error(err.message || "Failed to delete checklist item");
    },
    onSuccess: () => {
      toast.success("Checklist item removed");
    },
    onSettled: () => {
      invalidate();
    },
  });

  return {
    addItem,
    isAdding,
    toggleItem,
    isToggling,
    deleteItem,
    isDeleting,
  };
}
