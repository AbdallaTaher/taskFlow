export function getAvatarUrl(photo) {
  if (!photo || photo.includes("default")) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  if (photo.startsWith("data:")) return photo;
  const origin = import.meta.env.VITE_API_URL || "";
  if (photo.startsWith("/api/")) return `${origin}${photo}`;
  if (photo.startsWith("/public/")) {
    return `${origin}/api/v1${photo}`;
  }
  return `${origin}${photo}`;
}
