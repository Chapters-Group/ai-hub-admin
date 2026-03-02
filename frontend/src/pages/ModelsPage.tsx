import { useState } from "react";
import { useNavigate } from "react-router";
import { useModels, useToggleModel, useSyncModels, useDeleteModel } from "@/hooks/useModels";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Bot, Plus, RefreshCw, Trash2, Power } from "lucide-react";
import type { OWUIModel } from "@/lib/types";

export function ModelsPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: models, isLoading } = useModels();
  const toggleModel = useToggleModel();
  const syncModels = useSyncModels();
  const deleteModel = useDeleteModel();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "custom" | "base">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!company) {
    return (
      <EmptyState
        icon={Bot}
        title="No company selected"
        description="Select a company from the sidebar to manage models."
      />
    );
  }

  if (isLoading) return <LoadingState />;

  const isCustom = (m: OWUIModel) => !!m.base_model_id;
  const filtered = models?.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    if (tab === "custom") return matchesSearch && isCustom(m);
    if (tab === "base") return matchesSearch && !isCustom(m);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Models & Agents — {company.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => syncModels.mutate()} disabled={syncModels.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {syncModels.isPending ? "Syncing..." : "Sync Models"}
          </Button>
          <Button onClick={() => navigate("/models/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border p-1">
          {(["all", "custom", "base"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All" : t === "custom" ? "Custom Agents" : "Base Models"}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search models..." />
        </div>
      </div>

      {filtered?.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No models found"
          description={tab === "custom" ? "No custom agents yet. Create one to get started." : "No models found."}
        />
      ) : (
        <div className="grid gap-3">
          {filtered?.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{m.name}</h3>
                        {isCustom(m) && <Badge variant="secondary">Custom</Badge>}
                        {m.is_active === false && <Badge variant="outline">Disabled</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-mono">{m.id}</span>
                        {m.base_model_id && <span>Base: {m.base_model_id}</span>}
                      </div>
                      {(m.meta?.description || m.info?.meta?.description) && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {(m.meta?.description ?? m.info?.meta?.description) as string}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {isCustom(m) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleModel.mutate(m.id)}
                          title={m.is_active === false ? "Enable" : "Disable"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/models/${encodeURIComponent(m.id)}`)}
                          title="Edit"
                        >
                          <Bot className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(m.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Model"
        description="Are you sure you want to delete this model from the instance?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteModel.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        loading={deleteModel.isPending}
      />
    </div>
  );
}
