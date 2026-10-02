import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTaskApi } from "../services/taskApi";

export function useTask(id) {
  const queryClient = useQueryClient();

  const {
    data: task,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskApi(id),
    enabled: Boolean(id),
    placeholderData: () => {
      const queries = queryClient.getQueriesData({ queryKey: ["tasks"] });
      for (const [, tasksList] of queries) {
        if (Array.isArray(tasksList)) {
          const match = tasksList.find((t) => t._id === id);
          if (match) return match;
        }
      }
      return undefined;
    },
  });

  return { task, isLoading: isLoading && !task, isError, error, refetch };
}
