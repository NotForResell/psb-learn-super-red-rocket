import { AxiosError } from "axios";
import { create } from "zustand";
import { fetchCurrentUser, login as loginApi, register as registerApi } from "../api/authApi";
import { User } from "../types/domain";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; full_name: string; role?: "student" | "teacher" }) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const initialToken = localStorage.getItem("psb_token");

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginApi(email, password);
      localStorage.setItem("psb_token", response.access_token);
      set({ token: response.access_token });
      await get().loadProfile();
    } catch (error) {
      set({ error: "Не удалось авторизоваться. Проверьте E-mail и пароль.", isLoading: false });
      throw error;
    }
    set({ isLoading: false });
  },
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerApi(payload);
      localStorage.setItem("psb_token", response.access_token);
      set({ token: response.access_token, user: response.user ?? null });
      if (!response.user) {
        await get().loadProfile();
      }
    } catch (error) {
      let message = "Регистрация не удалась. Попробуйте ещё раз позже.";
      const err = error as AxiosError<any>;
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 409 || detail?.code === "email_taken") {
        message = "Этот email уже зарегистрирован. Попробуйте войти или используйте другой адрес.";
      } else if (status === 400 && (detail?.loc?.includes("email") || detail?.field === "email")) {
        message = "Укажите корректный email.";
      }
      set({ error: message, isLoading: false });
      throw error;
    }
    set({ isLoading: false });
  },
  loadProfile: async () => {
    if (!get().token) return;
    set({ isLoading: true });
    try {
      const user = await fetchCurrentUser();
      set({ user });
    } catch (error) {
      set({ error: "Не удалось загрузить профиль. Пожалуйста, авторизуйтесь заново.", token: null });
      localStorage.removeItem("psb_token");
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem("psb_token");
    set({ token: null, user: null });
  },
  clearError: () => set({ error: null })
}));
