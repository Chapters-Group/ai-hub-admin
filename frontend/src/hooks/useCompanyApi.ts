import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Company,
  CompanyCreate,
  CompanyDetail,
  CompanyUpdate,
  HealthSummary,
} from "@/lib/types";
import { useCompanyStore } from "@/stores/companyStore";

export function useCompanies() {
  const setCompanies = useCompanyStore((s) => s.setCompanies);

  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await api.get<Company[]>("/api/companies/");
      setCompanies(res.data);
      return res.data;
    },
  });
}

export function useCompanyDetail(companyId: string | null) {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const res = await api.get<CompanyDetail>(`/api/companies/${companyId}`);
      return res.data;
    },
    enabled: !!companyId,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CompanyCreate) => {
      const res = await api.post<Company>("/api/companies/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useUpdateCompany(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CompanyUpdate) => {
      const res = await api.put<Company>(`/api/companies/${companyId}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      await api.delete(`/api/companies/${companyId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useHealthSummary() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await api.get<HealthSummary>("/api/health/");
      return res.data;
    },
    refetchInterval: 60000,
  });
}

export function useTriggerHealthCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const res = await api.post(`/api/health/${companyId}/check`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health"] }),
  });
}
