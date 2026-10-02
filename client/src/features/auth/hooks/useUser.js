import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "../services/authApi";

const getSavedUser = () => {
  try {
    const raw = localStorage.getItem("taskflow_user");
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

export function useUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const u = await getMeApi();
        if (u) {
          localStorage.setItem("taskflow_user", JSON.stringify(u));
        } else {
          localStorage.removeItem("taskflow_user");
        }
        return u;
      } catch (err) {
        if (err?.status === 401) {
          localStorage.removeItem("taskflow_user");
        }
        throw err;
      }
    },
    initialData: getSavedUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes freshness
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  return {
    user,
    isLoading: isLoading && !user,
    isAuthenticated: Boolean(user),
    error,
  };
}
