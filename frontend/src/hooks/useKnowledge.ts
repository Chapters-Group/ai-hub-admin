import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { KnowledgeBase, CreateKnowledgeRequest } from "@/lib/types";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export function useKnowledgeBases() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["knowledge", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/knowledge/`);
      const payload = res.data;
      // Open WebUI returns { items: [...], total: N }
      return (payload?.items ?? payload) as KnowledgeBase[];
    },
    enabled: !!companyId,
  });
}

export function useKnowledgeDetail(kbId: string | null) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["knowledge", companyId, kbId],
    queryFn: async () => {
      const res = await api.get<KnowledgeBase>(`/api/companies/${companyId}/knowledge/${kbId}`);
      return res.data;
    },
    enabled: !!companyId && !!kbId,
  });
}

export function useKnowledgeFiles(kbId: string | null) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["knowledge", companyId, kbId, "files"],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/knowledge/${kbId}/files`);
      const payload = res.data;
      return (payload?.items ?? payload) as KBFile[];
    },
    enabled: !!companyId && !!kbId,
  });
}

export function useCreateKnowledge() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateKnowledgeRequest) => {
      const res = await api.post(`/api/companies/${companyId}/knowledge/create`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", companyId] }),
  });
}

export function useUpdateKnowledge(kbId: string) {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/knowledge/${kbId}/update`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", companyId] });
      qc.invalidateQueries({ queryKey: ["knowledge", companyId, kbId] });
    },
  });
}

export function useDeleteKnowledge() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kbId: string) => {
      await api.delete(`/api/companies/${companyId}/knowledge/${kbId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", companyId] }),
  });
}

export function useUploadFileToKnowledge(kbId: string) {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Upload file to the instance
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post(
        `/api/companies/${companyId}/files/upload`,
        formData,
        { headers: { "Content-Type": undefined } }
      );
      const fileId = uploadRes.data.id;
      // Step 2: Add the uploaded file to the knowledge base
      const addRes = await api.post(
        `/api/companies/${companyId}/knowledge/${kbId}/file/add`,
        { file_id: fileId }
      );
      return addRes.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", companyId, kbId, "files"] });
      qc.invalidateQueries({ queryKey: ["knowledge", companyId, kbId] });
    },
  });
}

export function useAddFileToKnowledge(kbId: string) {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await api.post(`/api/companies/${companyId}/knowledge/${kbId}/file/add`, {
        file_id: fileId,
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", companyId, kbId] }),
  });
}

export function useRemoveFileFromKnowledge(kbId: string) {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await api.post(`/api/companies/${companyId}/knowledge/${kbId}/file/remove`, {
        file_id: fileId,
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", companyId, kbId] }),
  });
}

export function useResetKnowledge(kbId: string) {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/companies/${companyId}/knowledge/${kbId}/reset`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", companyId, kbId] }),
  });
}
