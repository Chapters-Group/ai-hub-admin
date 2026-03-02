import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanyApi";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/shared/LoadingState";
import { Copy, ArrowRight, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

type ResourceType = "config" | "banners" | "auth" | "rag" | "code-execution" | "models";

const RESOURCE_TYPES: { key: ResourceType; label: string; description: string }[] = [
  { key: "config", label: "Full Config Export", description: "Export entire config from source and import to target" },
  { key: "banners", label: "Banners", description: "Clone banner configuration" },
  { key: "auth", label: "Auth Settings", description: "Clone authentication & feature flags" },
  { key: "rag", label: "RAG Configuration", description: "Clone retrieval/RAG settings" },
  { key: "code-execution", label: "Code Execution", description: "Clone code execution settings" },
  { key: "models", label: "Default Models", description: "Clone default model configuration" },
];

export function CloneSyncPage() {
  const { data: companies, isLoading } = useCompanies();
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<ResourceType>>(new Set());
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);

  if (isLoading) return <LoadingState />;

  const companyList = companies ?? [];

  const toggleType = (type: ResourceType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const canClone = sourceId && targetId && sourceId !== targetId && selectedTypes.size > 0;

  const handleClone = async () => {
    if (!canClone) return;
    setStatus("running");
    setLog([]);
    const results: string[] = [];

    try {
      for (const type of selectedTypes) {
        results.push(`Cloning ${type}...`);
        setLog([...results]);

        if (type === "config") {
          // Full config: export from source, import to target
          const exported = await api.get(`/api/companies/${sourceId}/config/export`);
          await api.post(`/api/companies/${targetId}/config/import`, exported.data);
        } else {
          // Specific config section: read from source, write to target
          const data = await api.get(`/api/companies/${sourceId}/config/${type}`);
          await api.post(`/api/companies/${targetId}/config/${type}`, data.data);
        }

        results[results.length - 1] = `${type} — done`;
        setLog([...results]);
      }

      setStatus("success");
      results.push("All resources cloned successfully!");
      setLog([...results]);
    } catch (err) {
      setStatus("error");
      results.push(`Error: ${(err as Error).message}`);
      setLog([...results]);
    }
  };

  const sourceName = companyList.find((c) => c.id === sourceId)?.name;
  const targetName = companyList.find((c) => c.id === targetId)?.name;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clone & Sync</h1>

      {/* Source / Target Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Source</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Copy configuration from:</Label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select source instance...</option>
              {companyList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Target</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Apply configuration to:</Label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select target instance...</option>
              {companyList
                .filter((c) => c.id !== sourceId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Resource Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What to Clone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCE_TYPES.map((rt) => (
              <button
                key={rt.key}
                onClick={() => toggleType(rt.key)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  selectedTypes.has(rt.key)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-medium">{rt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rt.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex items-center gap-4">
        <Button onClick={handleClone} disabled={!canClone || status === "running"} size="lg">
          {status === "running" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cloning...
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Clone Configuration
            </>
          )}
        </Button>
        {sourceId && targetId && sourceId === targetId && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Source and target must be different
          </p>
        )}
      </div>

      {/* Log Output */}
      {log.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {status === "success" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {status === "error" && <AlertTriangle className="h-5 w-5 text-destructive" />}
              {status === "running" && <Loader2 className="h-5 w-5 animate-spin" />}
              Clone Log
              {sourceName && targetName && (
                <span className="text-sm font-normal text-muted-foreground">
                  {sourceName} → {targetName}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted p-3 font-mono text-xs space-y-1">
              {log.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
