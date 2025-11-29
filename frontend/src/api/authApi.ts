import httpClient from "./httpClient";
import { User } from "../types/domain";

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>("/api/v1/auth/login-json", {
    email,
    password
  });
  return response.data;
};

export const register = async (payload: {
  email: string;
  password: string;
  full_name: string;
  role?: "student" | "teacher";
}): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>("/api/v1/auth/register", payload);
  return response.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await httpClient.get<User>("/api/v1/users/me");
  return response.data;
};
