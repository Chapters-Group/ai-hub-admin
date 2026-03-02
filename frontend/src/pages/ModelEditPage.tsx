import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useModels, useBaseModels, useCreateModel, useUpdateModel } from "@/hooks/useModels";
import { useKnowledgeBases } from "@/hooks/useKnowledge";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ArrowLeft, Bot } from "lucide-react";
import type { KnowledgeBase } from "@/lib/types";

interface KnowledgeRef {
  id: string;
  name: string;
}

export function ModelEditPage() {
  const { modelId } = useParams();
  const isNew = modelId === "new";
  const navigate = useNavigate();
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: models, isLoading: modelsLoading } = useModels();
  const { data: baseModels } = useBaseModels();
  const { data: knowledgeBases } = useKnowledgeBases();
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();

  const existing = models?.find((m) => m.id === decodeURIComponent(modelId ?? ""));

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseModelId, setBaseModelId] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [selectedKBs, setSelectedKBs] = useState<KnowledgeRef[]>([]);

  useEffect(() => {
    if (existing) {
      setId(existing.id);
      setName(existing.name);
      // Description is at info.meta.description (normalized to meta.description)
      const desc = (existing.meta as Record<string, unknown>)?.description
        ?? existing.info?.meta?.description
        ?? "";
      setDescription(desc as string);
      // base_model_id is normalized to top level
      setBaseModelId(existing.base_model_id ?? existing.info?.base_model_id ?? "");
      // params are at info.params
      const params = existing.info?.params as Record<string, unknown> | undefined;
      setSystemPrompt((params?.system as string) ?? "");
      setTemperature(String(params?.temperature ?? "0.7"));
      // Knowledge refs are at info.meta.knowledge or meta.knowledge
      const knowledge = (existing.meta as Record<string, unknown>)?.knowledge
        ?? existing.info?.meta?.knowledge as unknown;
      if (Array.isArray(knowledge)) {
        setSelectedKBs(knowledge as KnowledgeRef[]);
      }
    }
  }, [existing]);

  if (!company) return <EmptyState icon={Bot} title="No company selected" />;
  if (!isNew && modelsLoading) return <LoadingState />;

  const toggleKB = (kb: KnowledgeBase) => {
    setSelectedKBs((prev) => {
      const exists = prev.some((k) => k.id === kb.id);
      if (exists) return prev.filter((k) => k.id !== kb.id);
      return [...prev, { id: kb.id, name: kb.name }];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      id: id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      meta: {
        description,
        knowledge: selectedKBs,
      },
      base_model_id: baseModelId,
      params: {
        system: systemPrompt || undefined,
        temperature: parseFloat(temperature),
      },
    };

    if (isNew) {
      createModel.mutate(payload, { onSuccess: () => navigate("/models") });
    } else {
      updateModel.mutate(payload, { onSuccess: () => navigate("/models") });
    }
  };

  const isPending = createModel.isPending || updateModel.isPending;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/models")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew ? "Create Agent" : `Edit: ${existing?.name ?? modelId}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modelName">Agent Name</Label>
              <Input
                id="modelName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (isNew) setId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }}
                placeholder="Product Support Agent"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelId">Agent ID</Label>
              <Input
                id="modelId"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="product-support-agent"
                disabled={!isNew}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelDesc">Description</Label>
              <Input
                id="modelDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseModel">Base Model</Label>
              <select
                id="baseModel"
                value={baseModelId}
                onChange={(e) => setBaseModelId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a base model...</option>
                {baseModels?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.id}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={8}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temp">
                Temperature: {temperature}
              </Label>
              <input
                id="temp"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {knowledgeBases && knowledgeBases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Knowledge Bases (RAG)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Select knowledge bases to attach to this agent.
              </p>
              <div className="space-y-2">
                {knowledgeBases.map((kb) => {
                  const isSelected = selectedKBs.some((k) => k.id === kb.id);
                  return (
                    <label
                      key={kb.id}
                      className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleKB(kb)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <div>
                        <span className="font-medium text-sm">{kb.name}</span>
                        {kb.description && (
                          <p className="text-xs text-muted-foreground">{kb.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {(createModel.isError || updateModel.isError) && (
          <p className="text-sm text-destructive">Failed to save model. Check the configuration.</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" type="button" onClick={() => navigate("/models")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isNew ? "Create Agent" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
