import { useQuery } from "@tanstack/react-query";
import { getTasksApi } from "../services/taskApi";

// Normalize filters to ensure stable queryKey across components
export const normalizeTaskFilters = (filters = {}) => {
  const clean = {};
  Object.keys(filters)
    .sort()
    .forEach((key) => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        clean[key] = val;
      }
    });
  return clean;
};

export function useTasks(filters = {}) {
  const normalizedFilters = normalizeTaskFilters(filters);

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["tasks", normalizedFilters],
    queryFn: () => getTasksApi(normalizedFilters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3, // 3 minutes cache freshness (instant page navigation)
    gcTime: 1000 * 60 * 15, // 15 minutes memory retention
  });

  return { tasks, isLoading, isError, error, refetch, isFetching };
}
