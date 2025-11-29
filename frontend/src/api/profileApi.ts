import httpClient from "./httpClient";
import { User } from "../types/domain";

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  avatar_url?: string | null;
}

export async function getCurrentUser(): Promise<User> {
  const response = await httpClient.get<User>("/api/v1/users/me");
  return response.data;
}

export async function updateProfile(data: UpdateProfilePayload): Promise<User> {
  const response = await httpClient.patch<User>("/api/v1/users/me", data);
  return response.data;
}

export async function changePassword(data: ChangePasswordPayload): Promise<void> {
  await httpClient.post("/api/v1/users/me/change-password", data);
}
