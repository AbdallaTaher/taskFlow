import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createTaskApi } from "../services/taskApi";

export function useCreateTask() {
  const queryClient = useQueryClient();

  const { mutate: createTask, isPending: isCreating } = useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create task");
    },
  });

  return { createTask, isCreating };
}
