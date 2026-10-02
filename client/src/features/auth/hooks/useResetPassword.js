import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordApi } from "../services/authApi";

export function useResetPassword() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: resetPassword, isPending: isLoading } = useMutation({
    mutationFn: ({ token, password, passwordConfirm }) =>
      resetPasswordApi({ token, password, passwordConfirm }),
    onSuccess: (user) => {
      if (user) {
        queryClient.setQueryData(["user"], user);
      }
      toast.success("Password reset successfully! Welcome back.");
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reset password. Link may be invalid or expired.");
    },
  });

  return { resetPassword, isLoading };
}
