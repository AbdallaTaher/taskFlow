import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Check, CheckCheck } from "lucide-react";
import { useSignup } from "../hooks/useSignup";
import { Spinner } from "../../../ui/Spinner";
import { ThemeToggle } from "../../../ui/ThemeToggle";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { signup, isLoading } = useSignup();

  const password = watch("password");

  const onSubmit = (data) => {
    signup({
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
  };

  return (
    <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
      {/* Decorative Blur Backgrounds */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-10 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"></div>
        <div className="absolute right-[-8%] bottom-12 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl"></div>
      </div>

      {/* Left Column: Visual Showcase */}
      <div className="relative hidden overflow-hidden rounded-[34px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0b1220]/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:shadow-[0_40px_90px_rgba(2,6,23,0.8)] backdrop-blur-xl lg:block">
        <div className="absolute -right-12 top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl"></div>
        <div className="absolute -left-8 bottom-10 h-44 w-44 rounded-full bg-sky-500/15 blur-3xl"></div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/20">
              <CheckCheck className="h-6 w-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">TaskFlow</div>
          </div>

          <div className="mt-8 rounded-[30px] border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-[#101a2d] dark:via-[#0d1528] dark:to-[#171d34] p-6 text-slate-900 dark:text-white shadow-[0_15px_35px_rgba(15,23,42,0.06)] dark:shadow-[0_28px_60px_rgba(16,26,61,0.55)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-semibold text-slate-600 dark:text-slate-300">
                  Sprint completion
                </div>
                <div className="mt-2 text-4xl font-black text-slate-900 dark:text-white">68%</div>
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Active sprint
              </div>
            </div>

            <div className="mt-8 space-y-3 pt-1">
              <div className="rounded-[22px] border border-violet-200 dark:border-white/10 bg-violet-50 dark:bg-violet-500/10 p-3 shadow-sm">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-bold text-violet-800 dark:text-violet-100">
                  <span>Design system</span>
                  <span>82%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-violet-500 to-blue-400"></div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-[#0e1f36]/80 p-3 shadow-sm">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-bold text-slate-800 dark:text-slate-200">
                  <span>Backend APIs</span>
                  <span>100%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-[100%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Start organizing your priorities today</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                </span>
                Personalized task priorities & due date tracking
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                </span>
                Subtasks checklist & activity updates
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                </span>
                Fast real-time filtering, search, and focus analytics
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Column: Signup Card */}
      <div className="relative mx-auto w-full max-w-lg rounded-[34px] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c1321]/90 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_40px_80px_rgba(2,6,23,0.92)] backdrop-blur-xl">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
            Join free
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Create an account
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Full name
            </label>
            <input
              type="text"
              placeholder="Maya Chen"
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-[#111b2d] disabled:opacity-50"
              {...register("name", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-[#111b2d] disabled:opacity-50"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-[#111b2d] disabled:opacity-50"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Repeat your password"
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-[#111b2d] disabled:opacity-50"
              {...register("passwordConfirm", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.passwordConfirm && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
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
              <Spinner className="w-5 h-5 text-white" text="Creating account..." />
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-600 dark:text-violet-300 hover:text-violet-700 dark:hover:text-violet-200 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
