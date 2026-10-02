import { apiClient } from "../../../services/apiClient";

export async function signupApi({ name, email, password, passwordConfirm }) {
  const res = await apiClient("/users/signup", {
    data: { name, email, password, passwordConfirm },
  });
  return res.data;
}

export async function loginApi({ email, password }) {
  const res = await apiClient("/users/login", {
    data: { email, password },
  });
  return res.data;
}

export async function getMeApi() {
  const res = await apiClient("/users/me");
  return res.data.user;
}

export async function logoutApi() {
  await apiClient("/users/logout");
}

export async function updateMeApi(payload) {
  const res = await apiClient("/users/updateMe", {
    method: "PATCH",
    data: payload,
  });
  return res.data.user;
}

export async function updatePasswordApi({
  passwordCurrent,
  password,
  passwordConfirm,
}) {
  const res = await apiClient("/users/updateMyPassword", {
    method: "PATCH",
    data: { passwordCurrent, password, passwordConfirm },
  });
  return res.data?.user || res.data;
}

export async function forgotPasswordApi({ email }) {
  const res = await apiClient("/users/forgotPassword", {
    data: { email },
  });
  return res;
}

export async function resetPasswordApi({ token, password, passwordConfirm }) {
  const res = await apiClient(`/users/resetPassword/${token}`, {
    method: "PATCH",
    data: { password, passwordConfirm },
  });
  return res.data?.user || res.data;
}
