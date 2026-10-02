import { apiClient } from "../../../services/apiClient";

export async function getTasksApi(params = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : "/tasks";

  const res = await apiClient(endpoint);
  return res.data?.tasks || [];
}

export async function getTaskApi(id) {
  const res = await apiClient(`/tasks/${id}`);
  return res.data?.task;
}

export async function createTaskApi(taskData) {
  const res = await apiClient("/tasks", {
    method: "POST",
    data: taskData,
  });
  return res.data?.task;
}

export async function updateTaskApi(id, taskData) {
  const res = await apiClient(`/tasks/${id}`, {
    method: "PATCH",
    data: taskData,
  });
  return res.data?.task;
}

export async function deleteTaskApi(id) {
  await apiClient(`/tasks/${id}`, {
    method: "DELETE",
  });
  return true;
}

export async function addChecklistItemApi(id, text) {
  const res = await apiClient(`/tasks/${id}/checklist`, {
    method: "POST",
    data: { text },
  });
  return res.data?.task;
}

export async function toggleChecklistItemApi(id, itemId, completed) {
  const res = await apiClient(`/tasks/${id}/checklist/${itemId}`, {
    method: "PATCH",
    data: { completed },
  });
  return res.data?.task;
}

export async function deleteChecklistItemApi(id, itemId) {
  const res = await apiClient(`/tasks/${id}/checklist/${itemId}`, {
    method: "DELETE",
  });
  return res.data?.task;
}

export async function getDashboardStatsApi() {
  const res = await apiClient("/tasks/dashboard-stats");
  return res.data?.stats;
}

