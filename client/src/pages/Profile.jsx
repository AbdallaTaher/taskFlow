import { Shield } from "lucide-react";
import { UpdateProfileForm } from "../features/auth/components/UpdateProfileForm";
import { UpdatePasswordForm } from "../features/auth/components/UpdatePasswordForm";
import { useUser } from "../features/auth/hooks/useUser";
import { getAvatarUrl } from "../utils/avatar";

export default function Profile() {
  const { user } = useUser();

  const displayName =
    user?.name && user.name.trim().toLowerCase() !== "user"
      ? user.name
      : user?.email
        ? user.email.split("@")[0]
        : "Account";

  const userInitial = displayName ? displayName[0].toUpperCase() : "A";

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300 mb-2">
            <Shield className="h-3.5 w-3.5" /> Personal Account
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Profile & Security
          </h1>
          <p className="text-sm text-slate-400">
            Manage your personal information, email preferences, and password security.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto rounded-2xl border border-white/10 bg-[#0c1424] px-4 py-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/30 text-violet-300 font-bold text-base overflow-hidden">
            {getAvatarUrl(user?.photo) ? (
              <img src={getAvatarUrl(user.photo)} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              userInitial
            )}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{displayName}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Settings Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UpdateProfileForm />
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
