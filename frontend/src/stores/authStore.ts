import { create } from "zustand";
import type { AdminUser } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("token"),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
}));
