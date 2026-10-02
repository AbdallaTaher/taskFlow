import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteTaskApi } from "../services/taskApi";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  const { mutate: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deleteTaskApi(id),
    onSuccess: () => {
      toast.success("Task deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete task");
    },
  });

  return { deleteTask, isDeleting };
}
