export function getAvatarUrl(photo) {
  if (!photo || photo.includes("default")) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  if (photo.startsWith("/api/")) return photo;
  if (photo.startsWith("/public/")) {
    return `/api/v1${photo}`;
  }
  return photo;
}
