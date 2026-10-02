import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updatePasswordApi, logoutApi } from "../services/authApi";

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: updatePassword, isPending: isUpdating } = useMutation({
    mutationFn: ({ passwordCurrent, password, passwordConfirm }) =>
      updatePasswordApi({ passwordCurrent, password, passwordConfirm }),
    onSuccess: async () => {
      // Clear cookie and local cache so user logs in cleanly with new password
      try {
        await logoutApi();
      } catch (err) {
        // ignore logout network errors
      }
      queryClient.setQueryData(["user"], null);
      queryClient.removeQueries();
      toast.success(
        "Password changed successfully! Please log in with your new password.",
      );
      navigate("/login", { replace: true });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update password");
    },
  });

  return { updatePassword, isUpdating };
}
