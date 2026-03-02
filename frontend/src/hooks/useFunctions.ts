import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export interface OWUIFunction {
  id: string;
  user_id: string;
  name: string;
  type: string;
  content: string;
  meta?: { description?: string; manifest?: Record<string, unknown> };
  is_active?: boolean;
  is_global?: boolean;
  created_at?: number;
  updated_at?: number;
}

export function useFunctions() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["functions", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/functions/`);
      const payload = res.data;
      return (Array.isArray(payload) ? payload : payload?.data ?? payload) as OWUIFunction[];
    },
    enabled: !!companyId,
  });
}

export function useFunction(functionId: string | undefined) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["functions", companyId, functionId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/functions/id/${functionId}`);
      return res.data as OWUIFunction;
    },
    enabled: !!companyId && !!functionId,
  });
}

export function useCreateFunction() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; name: string; content: string; meta: Record<string, unknown> }) => {
      const res = await api.post(`/api/companies/${companyId}/functions/create`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["functions", companyId] }),
  });
}

export function useUpdateFunction() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ functionId, data }: { functionId: string; data: Record<string, unknown> }) => {
      const res = await api.post(`/api/companies/${companyId}/functions/id/${functionId}/update`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["functions", companyId] }),
  });
}

export function useDeleteFunction() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (functionId: string) => {
      await api.delete(`/api/companies/${companyId}/functions/id/${functionId}/delete`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["functions", companyId] }),
  });
}

export function useToggleFunction() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (functionId: string) => {
      const res = await api.post(`/api/companies/${companyId}/functions/id/${functionId}/toggle`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["functions", companyId] }),
  });
}

export function useToggleFunctionGlobal() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (functionId: string) => {
      const res = await api.post(`/api/companies/${companyId}/functions/id/${functionId}/toggle/global`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["functions", companyId] }),
  });
}
