import { useState } from "react";
import { useNavigate } from "react-router";
import { useKnowledgeBases, useCreateKnowledge, useDeleteKnowledge } from "@/hooks/useKnowledge";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Trash2, FolderOpen } from "lucide-react";

export function KnowledgePage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: knowledgeBases, isLoading } = useKnowledgeBases();
  const createKB = useCreateKnowledge();
  const deleteKB = useDeleteKnowledge();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!company) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No company selected"
        description="Select a company from the sidebar to manage knowledge bases."
      />
    );
  }

  if (isLoading) return <LoadingState />;

  const filtered = knowledgeBases?.filter((kb) =>
    kb.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createKB.mutate(
      { name: newName, description: newDesc || undefined },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewName("");
          setNewDesc("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Bases — {company.name}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Knowledge Base
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search knowledge bases..." />

      {filtered?.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No knowledge bases"
          description="Create a knowledge base to start uploading documents for RAG."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Knowledge Base
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered?.map((kb) => {
            return (
              <Card
                key={kb.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/knowledge/${kb.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2.5 mt-0.5">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{kb.name}</h3>
                        {kb.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {kb.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            Click to view files
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(kb.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogClose onClick={() => setShowCreate(false)} />
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="kbName">Name</Label>
              <Input
                id="kbName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Product Documentation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kbDesc">Description</Label>
              <Input
                id="kbDesc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            {createKB.isError && (
              <p className="text-sm text-destructive">Failed to create knowledge base.</p>
            )}
            <Button type="submit" className="w-full" disabled={createKB.isPending}>
              {createKB.isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Knowledge Base"
        description="Are you sure? This will remove the knowledge base and all its file associations on the instance."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteKB.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        loading={deleteKB.isPending}
      />
    </div>
  );
}
