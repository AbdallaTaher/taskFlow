import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { forgotPasswordApi } from "../services/authApi";

export function useForgotPassword() {
  const {
    mutate: forgotPassword,
    isPending: isLoading,
    data,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email }) => forgotPasswordApi({ email }),
    onSuccess: () => {
      toast.success("Password reset instructions sent!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to process forgot password request");
    },
  });

  return { forgotPassword, isLoading, data, isSuccess };
}
