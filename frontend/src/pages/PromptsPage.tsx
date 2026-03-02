import { useState } from "react";
import {
  usePrompts,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
} from "@/hooks/usePrompts";
import type { OWUIPrompt } from "@/hooks/usePrompts";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { FileText, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { format } from "date-fns";

export function PromptsPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: prompts, isLoading } = usePrompts();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newCommand, setNewCommand] = useState("");
  const [newContent, setNewContent] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCommand, setEditCommand] = useState("");
  const [editContent, setEditContent] = useState("");

  if (!company) {
    return (
      <EmptyState
        icon={FileText}
        title="No company selected"
        description="Select a company from the sidebar to manage prompts."
      />
    );
  }

  if (isLoading) return <LoadingState />;

  const promptList = prompts ?? [];
  const filtered = search.trim()
    ? promptList.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.command.toLowerCase().includes(search.toLowerCase())
      )
    : promptList;

  const handleCreate = () => {
    if (!newName.trim() || !newCommand.trim()) return;
    createPrompt.mutate(
      {
        command: newCommand.startsWith("/") ? newCommand : `/${newCommand}`,
        name: newName,
        content: newContent,
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewCommand("");
          setNewContent("");
          setShowCreate(false);
        },
      }
    );
  };

  const startEdit = (p: OWUIPrompt) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditCommand(p.command);
    setEditContent(p.content);
  };

  const handleUpdate = () => {
    if (!editingId || !editName.trim()) return;
    updatePrompt.mutate(
      {
        promptId: editingId,
        data: {
          command: editCommand.startsWith("/") ? editCommand : `/${editCommand}`,
          name: editName,
          content: editContent,
        },
      },
      { onSuccess: () => setEditingId(null) }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompts — {company.name}</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Prompt"
                />
              </div>
              <div className="space-y-1">
                <Label>Command</Label>
                <Input
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value)}
                  placeholder="/my-prompt"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Content</Label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-input bg-background p-2 text-sm font-mono resize-y"
                placeholder="Prompt template content..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createPrompt.isPending}>
                {createPrompt.isPending ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Prompt List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? "No prompts match your search" : "No prompts yet"}
          description={search ? "Try a different search term." : "Create a prompt to get started."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) =>
            editingId === p.id ? (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Command</Label>
                      <Input value={editCommand} onChange={(e) => setEditCommand(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Content</Label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={8}
                      className="w-full rounded-md border border-input bg-background p-2 text-sm font-mono resize-y"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} disabled={updatePrompt.isPending}>
                      {updatePrompt.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={p.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{p.name}</h3>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {p.command}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-mono">
                        {p.content || "No content"}
                      </p>
                      {p.updated_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated {format(new Date(p.updated_at * 1000), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deletePrompt.mutate(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
