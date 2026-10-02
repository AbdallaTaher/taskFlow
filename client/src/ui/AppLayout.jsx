import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  CheckCheck,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useUser } from "../features/auth/hooks/useUser";
import { useLogout } from "../features/auth/hooks/useLogout";
import { getAvatarUrl } from "../utils/avatar";
import { Spinner } from "./Spinner";
import { ThemeToggle } from "./ThemeToggle";

export function AppLayout() {
  const location = useLocation();
  const { user } = useUser();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName =
    user?.name && user.name.trim().toLowerCase() !== "user"
      ? user.name
      : user?.email
        ? user.email.split("@")[0]
        : "Account";
  const userInitial = displayName ? displayName[0].toUpperCase() : "A";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isDashboardActive = location.pathname === "/dashboard";
  const isTasksActive =
    location.pathname === "/tasks" || location.pathname.startsWith("/tasks/");
  const isProfileActive = location.pathname === "/profile";

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-violet-500/30 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#0b1220]/85 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-xl"
              aria-label="TaskFlow Dashboard"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
                <CheckCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                  TaskFlow
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Pro
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  isDashboardActive
                    ? "bg-violet-500/15 border border-violet-500/30 text-violet-200 shadow-sm shadow-violet-500/15"
                    : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <LayoutGrid
                  className={`h-4 w-4 ${isDashboardActive ? "text-violet-400" : "text-slate-400"}`}
                />
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  isTasksActive
                    ? "bg-violet-500/15 border border-violet-500/30 text-violet-200 shadow-sm shadow-violet-500/15"
                    : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <ListChecks
                  className={`h-4 w-4 ${isTasksActive ? "text-violet-400" : "text-slate-400"}`}
                />
                Tasks
              </Link>
            </nav>
          </div>

          {/* Right Area: Theme Toggle, Profile Chip, Logout & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Profile Link */}
            <Link
              to="/profile"
              className={`flex items-center gap-2.5 rounded-full border px-3 py-1.5 transition-all duration-200 text-left ${
                isProfileActive
                  ? "border-violet-500/40 bg-violet-500/15 text-white ring-1 ring-violet-500/20 shadow-sm shadow-violet-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-200"
              }`}
              title="My Profile"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs overflow-hidden shadow-inner flex-shrink-0">
                {getAvatarUrl(user?.photo) ? (
                  <img
                    src={getAvatarUrl(user.photo)}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>
              <div className="hidden sm:block text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                {displayName}
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-200 transition-all duration-200 disabled:opacity-50"
              title="Logout from TaskFlow"
            >
              {isLoggingOut ? (
                <Spinner className="w-3.5 h-3.5 text-slate-300" text="" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#090f1b]/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isDashboardActive
                  ? "bg-violet-500/20 border border-violet-500/30 text-violet-200"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-4 w-4 text-violet-400" />
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isTasksActive
                  ? "bg-violet-500/20 border border-violet-500/30 text-violet-200"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ListChecks className="h-4 w-4 text-violet-400" />
              Tasks
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isProfileActive
                  ? "bg-violet-500/20 border border-violet-500/30 text-violet-200"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4 text-violet-400" />
              Profile & Security
            </Link>

            <div className="pt-2 border-t border-white/10 mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Appearance</span>
                <ThemeToggle showLabel />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/30 text-violet-300 font-bold text-xs overflow-hidden">
                    {getAvatarUrl(user?.photo) ? (
                      <img
                        src={getAvatarUrl(user.photo)}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{displayName}</span>
                </div>
                <button
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Outlet */}
      <main className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </main>
    </div>
  );
}
