import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logoutApi } from "../services/authApi";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logout, isPending: isLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      queryClient.removeQueries();
      localStorage.removeItem("taskflow_user");
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    },
    onError: () => {
      queryClient.setQueryData(["user"], null);
      queryClient.removeQueries();
      localStorage.removeItem("taskflow_user");
      navigate("/login", { replace: true });
    },
  });

  return { logout, isLoading };
}
