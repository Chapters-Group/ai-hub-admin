import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { OWUIGroup, CreateGroupRequest } from "@/lib/types";
import { useCompanyStore } from "@/stores/companyStore";

function useCompanyId() {
  return useCompanyStore((s) => s.selectedCompanyId);
}

export function useGroups() {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["groups", companyId],
    queryFn: async () => {
      const res = await api.get<OWUIGroup[]>(`/api/companies/${companyId}/groups/`);
      return res.data;
    },
    enabled: !!companyId,
  });
}

export function useGroupDetail(groupId: string | null) {
  const companyId = useCompanyId();
  return useQuery({
    queryKey: ["groups", companyId, groupId],
    queryFn: async () => {
      const res = await api.get<OWUIGroup>(`/api/companies/${companyId}/groups/${groupId}`);
      return res.data;
    },
    enabled: !!companyId && !!groupId,
  });
}

export function useCreateGroup() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGroupRequest) => {
      const res = await api.post(`/api/companies/${companyId}/groups/create`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups", companyId] }),
  });
}

export function useUpdateGroup(groupId: string) {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post(`/api/companies/${companyId}/groups/${groupId}/update`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", companyId] });
      qc.invalidateQueries({ queryKey: ["groups", companyId, groupId] });
    },
  });
}

export function useUpdateGroupMembers() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, currentUserIds, newUserIds }: {
      groupId: string;
      currentUserIds: string[];
      newUserIds: string[];
    }) => {
      const toAdd = newUserIds.filter((id) => !currentUserIds.includes(id));
      const toRemove = currentUserIds.filter((id) => !newUserIds.includes(id));

      if (toAdd.length > 0) {
        await api.post(`/api/companies/${companyId}/groups/${groupId}/users/add`, {
          user_ids: toAdd,
        });
      }
      if (toRemove.length > 0) {
        await api.post(`/api/companies/${companyId}/groups/${groupId}/users/remove`, {
          user_ids: toRemove,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", companyId] });
      qc.invalidateQueries({ queryKey: ["users", companyId] });
    },
  });
}

export function useDeleteGroup() {
  const companyId = useCompanyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      await api.delete(`/api/companies/${companyId}/groups/${groupId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups", companyId] }),
  });
}
