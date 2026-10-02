import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsApi } from "../services/taskApi";

export function useDashboardStats() {
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsApi,
    placeholderData: (previousData) => previousData,
  });

  return { stats, isLoading, isError, error, refetch, isFetching };
}
