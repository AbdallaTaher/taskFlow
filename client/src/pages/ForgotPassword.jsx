import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { CheckCheck, Mail, ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { useForgotPassword } from "../features/auth/hooks/useForgotPassword";
import { Spinner } from "../ui/Spinner";
import { ThemeToggle } from "../ui/ThemeToggle";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { forgotPassword, isLoading, data, isSuccess } = useForgotPassword();

  const onSubmit = (formData) => {
    forgotPassword(formData);
  };

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
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your registered email address to receive a secure link to reset your password.
          </p>
        </div>

        {/* Success Banner */}
        {isSuccess ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Reset Link Generated
              </h2>
              <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                A password reset token has been created for your account and expires in 10 minutes.
              </p>
            </div>

            {/* Quick Testing Link for Development/Portfolio */}
            {data?.resetToken && (
              <div className="rounded-2xl border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-950/40 p-4 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  Quick Access (Testing / Portfolio):
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 break-all">
                  Token: <span className="font-mono text-slate-900 dark:text-slate-200">{data.resetToken}</span>
                </p>
                <Link
                  to={`/reset-password/${data.resetToken}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 text-white dark:bg-violet-500/20 dark:text-violet-200 border border-transparent dark:border-violet-400/30 px-3.5 py-2 text-xs font-semibold hover:bg-violet-700 dark:hover:bg-violet-500/30 transition w-full justify-center shadow-md dark:shadow-none"
                >
                  Proceed to Reset Password Page
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-11 pr-4 py-3 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-[#111b2d] disabled:opacity-50"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Spinner className="w-5 h-5 text-white" text="Sending reset link..." />
              ) : (
                "Send Reset Link"
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
        )}
      </div>
    </div>
  );
}
