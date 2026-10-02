import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Camera, ShieldCheck } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { getAvatarUrl } from "../../../utils/avatar";
import { Spinner } from "../../../ui/Spinner";

export function UpdateProfileForm() {
  const { user } = useUser();
  const { updateUser, isUpdating } = useUpdateUser();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const displayName =
    user?.name && user.name.trim().toLowerCase() !== "user"
      ? user.name
      : user?.email
        ? user.email.split("@")[0]
        : "Account";
  const userInitial = displayName ? displayName[0].toUpperCase() : "A";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("File size exceeds 3MB limit. Please choose a smaller image.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    const nameToUpdate = data.name || user?.name;
    const emailToUpdate = data.email || user?.email;

    if (nameToUpdate) formData.append("name", nameToUpdate);
    if (emailToUpdate) formData.append("email", emailToUpdate);
    if (avatarFile) {
      formData.append("photo", avatarFile);
    }

    updateUser(formData, {
      onSuccess: () => {
        setAvatarFile(null);
      },
    });
  };

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0c1424]/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Account Details</h2>
          <p className="text-xs text-slate-400">Update your photo, name, and email address.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Avatar Upload Picker */}
        <div className="flex items-center gap-5 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-white/10 flex items-center justify-center text-xl font-bold text-violet-300 shadow-md">
              {avatarPreview || getAvatarUrl(user?.photo) ? (
                <img
                  src={avatarPreview || getAvatarUrl(user?.photo)}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center cursor-pointer shadow-lg transition"
              title="Upload new photo"
            >
              <Camera className="h-3.5 w-3.5" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUpdating}
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              JPG, PNG, or WEBP up to 3MB. Click the camera icon to choose.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Full name
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={isUpdating}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-[#111b2d] disabled:opacity-50"
              placeholder="Your full name"
              {...register("name", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
            <User className="h-4 w-4 text-slate-400 absolute left-4 top-3.5" />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Email address
          </label>
          <div className="relative">
            <input
              type="email"
              disabled={isUpdating}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-[#111b2d] disabled:opacity-50"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            <Mail className="h-4 w-4 text-slate-400 absolute left-4 top-3.5" />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <Spinner className="w-4 h-4 text-white" text="Saving..." />
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
