import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export interface OWUIFile {
  id: string;
  user_id: string;
  hash?: string;
  filename: string;
  data?: { status?: string; content?: string };
  meta?: { name?: string; content_type?: string; size?: number };
  created_at?: number;
  updated_at?: number;
}

export function useFiles() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["files", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/files/`);
      const payload = res.data;
      return (Array.isArray(payload) ? payload : payload?.data ?? payload) as OWUIFile[];
    },
    enabled: !!companyId,
  });
}

export function useUploadFile() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/api/companies/${companyId}/files/upload`, formData, {
        headers: { "Content-Type": undefined },
      });
      return res.data as OWUIFile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files", companyId] }),
  });
}

export function useDeleteFile() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(`/api/companies/${companyId}/files/${fileId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files", companyId] }),
  });
}
