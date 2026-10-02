import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateMeApi } from "../services/authApi";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: (payload) => updateMeApi(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      localStorage.setItem("taskflow_user", JSON.stringify(user));
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  return { updateUser, isUpdating };
}
