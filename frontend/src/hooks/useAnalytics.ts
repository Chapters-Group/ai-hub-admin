import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export function useAnalyticsSummary(startDate?: number, endDate?: number) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["analytics", "summary", companyId, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get(`/api/companies/${companyId}/analytics/summary`, { params });
      return res.data as { total_messages: number; total_chats: number; total_models: number; total_users: number };
    },
    enabled: !!companyId,
  });
}

export function useModelAnalytics(startDate?: number, endDate?: number) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["analytics", "models", companyId, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get(`/api/companies/${companyId}/analytics/models`, { params });
      return res.data as { models: { model_id: string; count: number }[] };
    },
    enabled: !!companyId,
  });
}

export function useUserAnalytics(startDate?: number, endDate?: number, limit = 50) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["analytics", "users", companyId, startDate, endDate, limit],
    queryFn: async () => {
      const params: Record<string, unknown> = { limit };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get(`/api/companies/${companyId}/analytics/users`, { params });
      return res.data as {
        users: {
          user_id: string;
          name: string | null;
          email: string | null;
          count: number;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
        }[];
      };
    },
    enabled: !!companyId,
  });
}

export function useDailyStats(startDate?: number, endDate?: number, granularity = "daily") {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["analytics", "daily", companyId, startDate, endDate, granularity],
    queryFn: async () => {
      const params: Record<string, unknown> = { granularity };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get(`/api/companies/${companyId}/analytics/daily`, { params });
      return res.data as { data: { date: string; models: Record<string, number> }[] };
    },
    enabled: !!companyId,
  });
}

export function useTokenUsage(startDate?: number, endDate?: number) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["analytics", "tokens", companyId, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get(`/api/companies/${companyId}/analytics/tokens`, { params });
      return res.data as {
        models: {
          model_id: string;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
          message_count: number;
        }[];
        total_input_tokens: number;
        total_output_tokens: number;
        total_tokens: number;
      };
    },
    enabled: !!companyId,
  });
}
