import { useForm } from "react-hook-form";
import { Lock, KeyRound } from "lucide-react";
import { useUpdatePassword } from "../hooks/useUpdatePassword";
import { Spinner } from "../../../ui/Spinner";

export function UpdatePasswordForm() {
  const { updatePassword, isUpdating } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const passwordCurrent = watch("passwordCurrent");
  const newPassword = watch("password");

  const onSubmit = (data) => {
    updatePassword({
      passwordCurrent: data.passwordCurrent,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
  };

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0c1424]/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Change Password</h2>
          <p className="text-xs text-slate-400">Ensure your account is using a secure password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Current password
          </label>
          <div className="relative">
            <input
              type="password"
              disabled={isUpdating}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-[#111b2d] disabled:opacity-50"
              placeholder="••••••••"
              {...register("passwordCurrent", {
                required: "Current password is required",
              })}
            />
            <Lock className="h-4 w-4 text-slate-400 absolute left-4 top-3.5" />
          </div>
          {errors.passwordCurrent && (
            <p className="mt-1 text-xs text-rose-400">{errors.passwordCurrent.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            New password
          </label>
          <div className="relative">
            <input
              type="password"
              disabled={isUpdating}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-[#111b2d] disabled:opacity-50"
              placeholder="Minimum 8 characters"
              {...register("password", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                validate: (value) =>
                  value !== passwordCurrent ||
                  "New password cannot be the same as your current password",
              })}
            />
            <Lock className="h-4 w-4 text-slate-400 absolute left-4 top-3.5" />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type="password"
              disabled={isUpdating}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-[#111b2d] disabled:opacity-50"
              placeholder="Repeat your new password"
              {...register("passwordConfirm", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
            />
            <Lock className="h-4 w-4 text-slate-400 absolute left-4 top-3.5" />
          </div>
          {errors.passwordConfirm && (
            <p className="mt-1 text-xs text-rose-400">{errors.passwordConfirm.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <Spinner className="w-4 h-4 text-white" text="Updating..." />
            ) : (
              "Update password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
