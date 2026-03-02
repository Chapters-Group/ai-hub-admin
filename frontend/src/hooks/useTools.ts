import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export interface OWUITool {
  id: string;
  user_id: string;
  name: string;
  content: string;
  meta?: { description?: string; manifest?: Record<string, unknown> };
  specs?: unknown[];
  is_active?: boolean;
  created_at?: number;
  updated_at?: number;
}

export function useTools() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["tools", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/tools/`);
      const payload = res.data;
      return (Array.isArray(payload) ? payload : payload?.data ?? payload) as OWUITool[];
    },
    enabled: !!companyId,
  });
}

export function useTool(toolId: string | undefined) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["tools", companyId, toolId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/tools/id/${toolId}`);
      return res.data as OWUITool;
    },
    enabled: !!companyId && !!toolId,
  });
}

export function useCreateTool() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; name: string; content: string; meta: Record<string, unknown> }) => {
      const res = await api.post(`/api/companies/${companyId}/tools/create`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools", companyId] }),
  });
}

export function useUpdateTool() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ toolId, data }: { toolId: string; data: Record<string, unknown> }) => {
      const res = await api.post(`/api/companies/${companyId}/tools/id/${toolId}/update`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools", companyId] }),
  });
}

export function useDeleteTool() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (toolId: string) => {
      await api.delete(`/api/companies/${companyId}/tools/id/${toolId}/delete`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools", companyId] }),
  });
}
