import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export function useAuthConfig() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["config", "auth", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/config/auth`);
      return res.data as Record<string, unknown>;
    },
    enabled: !!companyId,
  });
}

export function useUpdateAuthConfig() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/config/auth`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config", "auth", companyId] }),
  });
}

export function useBanners() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["config", "banners", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/config/banners`);
      return res.data as unknown[];
    },
    enabled: !!companyId,
  });
}

export function useUpdateBanners() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (banners: unknown[]) => {
      const res = await api.post(`/api/companies/${companyId}/config/banners`, { banners });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config", "banners", companyId] }),
  });
}

export function useRagConfig() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["config", "rag", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/config/rag`);
      return res.data as Record<string, unknown>;
    },
    enabled: !!companyId,
  });
}

export function useUpdateRagConfig() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/config/rag`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config", "rag", companyId] }),
  });
}

export function useCodeExecutionConfig() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["config", "code-execution", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/config/code-execution`);
      return res.data as Record<string, unknown>;
    },
    enabled: !!companyId,
  });
}

export function useUpdateCodeExecutionConfig() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/config/code-execution`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config", "code-execution", companyId] }),
  });
}

export function useDefaultModelsConfig() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["config", "models", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/config/models`);
      return res.data as Record<string, unknown>;
    },
    enabled: !!companyId,
  });
}

export function useUpdateDefaultModelsConfig() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/config/models`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config", "models", companyId] }),
  });
}
