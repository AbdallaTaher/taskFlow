import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { CheckCheck, KeyRound, Lock, ArrowLeft } from "lucide-react";
import { useResetPassword } from "../features/auth/hooks/useResetPassword";
import { Spinner } from "../ui/Spinner";
import { ThemeToggle } from "../ui/ThemeToggle";

export default function ResetPassword() {
  const { token } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { resetPassword, isLoading } = useResetPassword();
  const password = watch("password");

  const onSubmit = (data) => {
    resetPassword({
      token,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[32px] border border-rose-500/30 bg-white/95 dark:bg-[#0c1321]/90 p-8 text-center backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">Invalid Reset Link</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            No valid reset token was detected in the URL. Please request a new password reset link.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 text-white dark:bg-white/10 dark:text-white px-5 py-2.5 text-sm font-semibold hover:bg-violet-700 dark:hover:bg-white/15 transition shadow-lg shadow-violet-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070b14] flex items-center justify-center px-4 py-12">
      {/* Decorative Blur Backgrounds */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-10 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"></div>
        <div className="absolute right-[-10%] bottom-10 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c1321]/90 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_40px_80px_rgba(2,6,23,0.92)] backdrop-blur-xl">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/20">
            <CheckCheck className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">TaskFlow</span>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Please choose a strong password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                placeholder="At least 8 characters"
                disabled={isLoading}
                className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-11 pr-4 py-3 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-[#111b2d] disabled:opacity-50"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <input
                type="password"
                placeholder="Repeat your new password"
                disabled={isLoading}
                className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-11 pr-4 py-3 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-[#111b2d] disabled:opacity-50"
                {...register("passwordConfirm", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
            </div>
            {errors.passwordConfirm && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Spinner className="w-5 h-5 text-white" text="Updating password..." />
            ) : (
              "Reset Password & Sign In"
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
