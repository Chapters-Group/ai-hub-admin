import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { OWUIModel } from "@/lib/types";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

function normalizeModel(m: Record<string, unknown>): OWUIModel {
  const info = (m.info ?? {}) as OWUIModel["info"];
  return {
    ...m,
    base_model_id: info?.base_model_id ?? null,
    is_active: info?.is_active ?? true,
    meta: info?.meta as Record<string, unknown> | undefined,
    info,
  } as OWUIModel;
}

export function useModels() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["models", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/models/`);
      const payload = res.data;
      const raw = (payload?.data ?? payload) as Record<string, unknown>[];
      return raw.map(normalizeModel);
    },
    enabled: !!companyId,
  });
}

export function useBaseModels() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["baseModels", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/models/base`);
      const payload = res.data;
      return (payload?.data ?? payload) as OWUIModel[];
    },
    enabled: !!companyId,
  });
}

export function useCreateModel() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/models/create`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["models", companyId] }),
  });
}

export function useUpdateModel() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/models/update`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["models", companyId] }),
  });
}

export function useDeleteModel() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (modelId: string) => {
      const res = await api.post(`/api/companies/${companyId}/models/delete`, { id: modelId });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["models", companyId] }),
  });
}

export function useToggleModel() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (modelId: string) => {
      const res = await api.post(`/api/companies/${companyId}/models/${modelId}/toggle`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["models", companyId] }),
  });
}

export function useSyncModels() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/companies/${companyId}/models/sync`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["models", companyId] }),
  });
}

export function useConnections() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["connections", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/models/connections`);
      return res.data;
    },
    enabled: !!companyId,
  });
}
