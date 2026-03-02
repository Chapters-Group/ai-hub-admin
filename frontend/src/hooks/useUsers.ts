import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { OWUIUser, CreateUserRequest, UpdateUserRequest } from "@/lib/types";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export function useUsers() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["users", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/users/`);
      const payload = res.data;
      // Open WebUI returns { users: [...], total: N }
      return (payload?.users ?? payload) as OWUIUser[];
    },
    enabled: !!companyId,
  });
}

export function useCreateUser() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const res = await api.post(`/api/companies/${companyId}/users/signup`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", companyId] }),
  });
}

export function useUpdateUser() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserRequest }) => {
      const res = await api.post(`/api/companies/${companyId}/users/${userId}/update`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", companyId] }),
  });
}

export function useUpdateUserRole() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.post(`/api/companies/${companyId}/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", companyId] }),
  });
}

export function useDeleteUser() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/companies/${companyId}/users/${userId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", companyId] }),
  });
}

export function useUserPermissions() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["userPermissions", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/users/permissions`);
      return res.data;
    },
    enabled: !!companyId,
  });
}

export function useUpdatePermissions() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/users/permissions`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userPermissions", companyId] }),
  });
}
