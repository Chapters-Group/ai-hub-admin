import { useState } from "react";
import { useTools, useDeleteTool } from "@/hooks/useTools";
import { useFunctions, useDeleteFunction, useToggleFunction, useToggleFunctionGlobal } from "@/hooks/useFunctions";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Wrench, Search, Trash2, Globe, Power } from "lucide-react";
import type { OWUITool } from "@/hooks/useTools";
import type { OWUIFunction } from "@/hooks/useFunctions";
import { format } from "date-fns";

type Tab = "tools" | "functions";

export function ToolsPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const [tab, setTab] = useState<Tab>("tools");

  if (!company) {
    return (
      <EmptyState
        icon={Wrench}
        title="No company selected"
        description="Select a company from the sidebar to manage tools & functions."
      />
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "tools", label: "Tools" },
    { key: "functions", label: "Functions" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tools & Functions — {company.name}</h1>

      <div className="flex gap-1 rounded-lg border p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tools" && <ToolsTab />}
      {tab === "functions" && <FunctionsTab />}
    </div>
  );
}

function ToolsTab() {
  const { data: tools, isLoading } = useTools();
  const deleteTool = useDeleteTool();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <LoadingState />;

  const toolList = tools ?? [];
  const filtered = search.trim()
    ? toolList.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toLowerCase().includes(search.toLowerCase())
      )
    : toolList;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={search ? "No tools match" : "No tools"}
          description={search ? "Try a different search." : "No tools configured on this instance."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((t: OWUITool) => (
            <Card key={t.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{t.name}</h3>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {t.id}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t.meta?.description || "No description"}
                    </p>
                    {t.specs && t.specs.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.specs.length} function{t.specs.length !== 1 ? "s" : ""} exported
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => deleteTool.mutate(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {expandedId === t.id && t.content && (
                  <pre className="mt-3 rounded-md bg-muted p-3 text-xs font-mono overflow-auto max-h-80">
                    {t.content}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FunctionsTab() {
  const { data: functions, isLoading } = useFunctions();
  const deleteFunction = useDeleteFunction();
  const toggleFunction = useToggleFunction();
  const toggleGlobal = useToggleFunctionGlobal();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <LoadingState />;

  const funcList = functions ?? [];
  const filtered = search.trim()
    ? funcList.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.id.toLowerCase().includes(search.toLowerCase())
      )
    : funcList;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search functions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={search ? "No functions match" : "No functions"}
          description={search ? "Try a different search." : "No functions configured on this instance."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((f: OWUIFunction) => (
            <Card key={f.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{f.name}</h3>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {f.id}
                      </code>
                      {f.type && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {f.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {f.meta?.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      title={f.is_active ? "Active — click to disable" : "Inactive — click to enable"}
                      onClick={() => toggleFunction.mutate(f.id)}
                    >
                      <Power className={`h-4 w-4 ${f.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title={f.is_global ? "Global — click to remove" : "Not global — click to set global"}
                      onClick={() => toggleGlobal.mutate(f.id)}
                    >
                      <Globe className={`h-4 w-4 ${f.is_global ? "text-blue-600" : "text-muted-foreground"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteFunction.mutate(f.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedId === f.id && f.content && (
                  <pre className="mt-3 rounded-md bg-muted p-3 text-xs font-mono overflow-auto max-h-80">
                    {f.content}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
