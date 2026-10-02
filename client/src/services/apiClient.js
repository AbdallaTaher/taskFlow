const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const BASE_URL = `${API_ORIGIN}/api/v1`;

export async function apiClient(endpoint, { data, token, ...customConfig } = {}) {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: data ? "POST" : "GET",
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    credentials: "include",
    ...customConfig,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "Something went wrong");
    error.status = response.status;
    error.data = result;
    throw error;
  }

  return result;
}
