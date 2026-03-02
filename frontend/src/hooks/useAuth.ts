import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AdminUser, LoginRequest, TokenResponse } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post<TokenResponse>("/api/auth/login", data);
      return res.data;
    },
    onSuccess: async (data) => {
      localStorage.setItem("token", data.access_token);
      // Fetch user profile
      const res = await api.get<AdminUser>("/api/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setAuth(data.access_token, res.data);
    },
  });
}

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get<AdminUser>("/api/auth/me");
      if (token) setAuth(token, res.data);
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}
