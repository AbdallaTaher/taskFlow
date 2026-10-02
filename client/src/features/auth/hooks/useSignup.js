import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signupApi } from "../services/authApi";

export function useSignup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signup, isPending: isLoading } = useMutation({
    mutationFn: ({ name, email, password, passwordConfirm }) =>
      signupApi({ name, email, password, passwordConfirm }),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create account");
    },
  });

  return { signup, isLoading };
}
