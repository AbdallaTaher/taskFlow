import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateTaskApi } from "../services/taskApi";

export function useUpdateTask() {
  const queryClient = useQueryClient();

  const { mutate: updateTask, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, taskData }) => updateTaskApi(id, taskData),
    onMutate: async ({ id, taskData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["task", id] });

      const prevTasks = queryClient.getQueryData(["tasks"]);
      const prevTask = queryClient.getQueryData(["task", id]);

      queryClient.setQueriesData({ queryKey: ["tasks"] }, (oldTasks) => {
        if (!Array.isArray(oldTasks)) return oldTasks;
        return oldTasks.map((t) => (t._id === id ? { ...t, ...taskData } : t));
      });

      queryClient.setQueryData(["task", id], (old) => {
        if (!old) return old;
        return { ...old, ...taskData };
      });

      return { prevTasks, prevTask };
    },
    onError: (err, { id }, context) => {
      if (context?.prevTasks) queryClient.setQueryData(["tasks"], context.prevTasks);
      if (context?.prevTask) queryClient.setQueryData(["task", id], context.prevTask);
      toast.error(err.message || "Failed to update task");
    },
    onSuccess: (_data, { id }) => {
      toast.success("Task updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
  });

  return { updateTask, isUpdating };
}
