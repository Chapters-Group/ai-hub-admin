import { useState } from "react";
import { useNavigate } from "react-router";
import { useCompanies, useDeleteCompany } from "@/hooks/useCompanyApi";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Building2, Plus, Trash2, ExternalLink } from "lucide-react";

export function CompaniesPage() {
  const { data: companies, isLoading } = useCompanies();
  const deleteCompany = useDeleteCompany();
  const selectCompany = useCompanyStore((s) => s.selectCompany);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = companies?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Companies</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search companies..." />

      {filtered?.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Register your first Open WebUI instance to get started."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => {
                    selectCompany(c.id);
                    navigate(`/companies/${c.id}`);
                  }}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[250px] truncate">
                    {c.instance_url}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.version ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(c.instance_url, "_blank")}
                        title="Open WebUI"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(c.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
            <DialogTitle>Add Company</DialogTitle>
          </DialogHeader>
          <CompanyForm onSuccess={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Company"
        description="Are you sure you want to remove this company from the admin panel? This does not affect the actual Open WebUI instance."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteCompany.mutate(deleteTarget, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        loading={deleteCompany.isPending}
      />
    </div>
  );
}
