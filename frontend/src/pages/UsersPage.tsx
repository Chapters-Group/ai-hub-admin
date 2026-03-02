import { useState } from "react";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/UserForm";
import { Users, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function UsersPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!company) {
    return (
      <EmptyState
        icon={Users}
        title="No company selected"
        description="Select a company from the sidebar to manage users."
      />
    );
  }

  if (isLoading) return <LoadingState />;

  const filtered = users?.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users — {company.name}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {filtered?.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={search ? "Try a different search term." : "Create the first user for this instance."}
          action={
            !search ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <select
                      value={u.role}
                      onChange={(e) => {
                        updateUser.mutate({
                          userId: u.id,
                          data: {
                            name: u.name,
                            email: u.email,
                            role: e.target.value,
                            profile_image_url: u.profile_image_url ?? "",
                          },
                        });
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="admin">admin</option>
                      <option value="user">user</option>
                      <option value="pending">pending</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.last_active_at
                      ? formatDistanceToNow(new Date(u.last_active_at * 1000), { addSuffix: true })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(u.id)}
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogClose onClick={() => setShowForm(false)} />
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <UserForm onSuccess={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action is performed on the Open WebUI instance and cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteUser.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        loading={deleteUser.isPending}
      />
    </div>
  );
}
