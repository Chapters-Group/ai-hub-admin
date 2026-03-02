import { useState } from "react";
import { useGroups, useUpdateGroupMembers, useDeleteGroup } from "@/hooks/useGroups";
import { useUsers, useUserPermissions, useUpdatePermissions } from "@/hooks/useUsers";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SearchInput } from "@/components/shared/SearchInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { GroupForm } from "@/components/forms/GroupForm";
import { UsersRound, Plus, Trash2, Users, UserPlus } from "lucide-react";
import type { OWUIGroup } from "@/lib/types";

export function GroupsPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: groups, isLoading } = useGroups();
  const { data: users } = useUsers();
  const { data: permissions } = useUserPermissions();
  const updatePermissions = useUpdatePermissions();
  const updateMembers = useUpdateGroupMembers();
  const deleteGroup = useDeleteGroup();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<OWUIGroup | null>(null);
  const [initialUserIds, setInitialUserIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  if (!company) {
    return (
      <EmptyState
        icon={UsersRound}
        title="No company selected"
        description="Select a company from the sidebar to manage groups."
      />
    );
  }

  if (isLoading) return <LoadingState />;

  const openMemberEditor = (group: OWUIGroup) => {
    const currentMembers = users?.filter((u) => u.group_ids?.includes(group.id)).map((u) => u.id) ?? [];
    setInitialUserIds(currentMembers);
    setSelectedUserIds(currentMembers);
    setMemberSearch("");
    setEditingGroup(group);
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const saveMembership = () => {
    if (!editingGroup) return;
    updateMembers.mutate(
      {
        groupId: editingGroup.id,
        currentUserIds: initialUserIds,
        newUserIds: selectedUserIds,
      },
      { onSuccess: () => setEditingGroup(null) }
    );
  };

  const filteredUsers = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups & Permissions — {company.name}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {groups?.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No groups"
          description="Create groups to organize users and control access to models."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {groups?.map((g) => {
            const members = users?.filter((u) => u.group_ids?.includes(g.id)) ?? [];
            const memberCount = g.member_count ?? members.length;
            return (
              <Card key={g.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2.5 mt-0.5">
                        <UsersRound className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{g.name}</h3>
                        {g.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {g.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary">
                            <Users className="mr-1 h-3 w-3" />
                            {memberCount} member{memberCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {members.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {members.map((m) => (
                              <div key={m.id} className="flex items-center gap-2 text-sm">
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                                  {m.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{m.name}</span>
                                <span className="text-muted-foreground text-xs">({m.email})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openMemberEditor(g)}
                        title="Manage members"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(g.id)}
                        title="Delete group"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {permissions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Global Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">
                Current permissions configuration from the instance:
              </p>
              <pre className="rounded-md bg-muted p-3 text-xs overflow-auto">
                {JSON.stringify(permissions, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Group Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogClose onClick={() => setShowForm(false)} />
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
          </DialogHeader>
          <GroupForm users={users ?? []} onSuccess={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="max-w-md">
          <DialogClose onClick={() => setEditingGroup(null)} />
          <DialogHeader>
            <DialogTitle>Manage Members — {editingGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <SearchInput
              value={memberSearch}
              onChange={setMemberSearch}
              placeholder="Search users..."
            />
            <div className="max-h-80 overflow-y-auto space-y-1">
              {filteredUsers?.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 rounded-md border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUser(u.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{u.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{u.role}</span>
                  </label>
                );
              })}
              {filteredUsers?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedUserIds.length} user{selectedUserIds.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingGroup(null)}>
                  Cancel
                </Button>
                <Button onClick={saveMembership} disabled={updateMembers.isPending}>
                  {updateMembers.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Group"
        description="Are you sure? Users in this group will lose any group-specific permissions."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteGroup.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        loading={deleteGroup.isPending}
      />
    </div>
  );
}
