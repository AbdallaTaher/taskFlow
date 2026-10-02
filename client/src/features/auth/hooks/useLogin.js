import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginApi } from "../services/authApi";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials");
    },
  });

  return { login, isLoading };
}
