import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export interface OWUIPrompt {
  id: string;
  command: string;
  name: string;
  content: string;
  user_id: string;
  data?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  tags?: string[];
  is_active?: boolean;
  created_at?: number;
  updated_at?: number;
}

export function usePrompts() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["prompts", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/prompts/`);
      const payload = res.data;
      return (Array.isArray(payload) ? payload : payload?.data ?? payload) as OWUIPrompt[];
    },
    enabled: !!companyId,
  });
}

export function usePrompt(promptId: string | undefined) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["prompts", companyId, promptId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/prompts/id/${promptId}`);
      return res.data as OWUIPrompt;
    },
    enabled: !!companyId && !!promptId,
  });
}

export function useCreatePrompt() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { command: string; name: string; content: string }) => {
      const res = await api.post(`/api/companies/${companyId}/prompts/create`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prompts", companyId] }),
  });
}

export function useUpdatePrompt() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      promptId,
      data,
    }: {
      promptId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await api.post(
        `/api/companies/${companyId}/prompts/id/${promptId}/update`,
        data
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prompts", companyId] }),
  });
}

export function useDeletePrompt() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      await api.delete(`/api/companies/${companyId}/prompts/id/${promptId}/delete`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prompts", companyId] }),
  });
}

export function usePromptHistory(promptId: string | undefined) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["prompts", companyId, promptId, "history"],
    queryFn: async () => {
      const res = await api.get(
        `/api/companies/${companyId}/prompts/id/${promptId}/history`
      );
      return res.data as Record<string, unknown>[];
    },
    enabled: !!companyId && !!promptId,
  });
}
