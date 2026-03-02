import { useState, useEffect, useCallback } from "react";
import {
  useAuthConfig,
  useUpdateAuthConfig,
  useBanners,
  useUpdateBanners,
  useRagConfig,
  useUpdateRagConfig,
  useCodeExecutionConfig,
  useUpdateCodeExecutionConfig,
  useDefaultModelsConfig,
  useUpdateDefaultModelsConfig,
} from "@/hooks/useConfig";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Settings, Save, RotateCcw } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

type Tab = "general" | "rag" | "auth" | "banners" | "code";

export function ConfigPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const [tab, setTab] = useState<Tab>("general");

  if (!company) {
    return (
      <EmptyState
        icon={Settings}
        title="No company selected"
        description="Select a company from the sidebar to manage configuration."
      />
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "rag", label: "RAG" },
    { key: "auth", label: "Auth" },
    { key: "banners", label: "Banners" },
    { key: "code", label: "Code Execution" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuration — {company.name}</h1>

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

      {tab === "general" && <GeneralTab />}
      {tab === "rag" && <RagTab />}
      {tab === "auth" && <AuthTab />}
      {tab === "banners" && <BannersTab />}
      {tab === "code" && <CodeTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared editable config component
// ---------------------------------------------------------------------------

function useConfigDraft(serverData: Record<string, unknown> | undefined) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);

  // Reset draft when server data changes (initial load or after save)
  useEffect(() => {
    if (serverData) {
      setDraft(structuredClone(serverData));
      setDirty(false);
    }
  }, [serverData]);

  const updateField = useCallback((key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const reset = useCallback(() => {
    if (serverData) {
      setDraft(structuredClone(serverData));
      setDirty(false);
    }
  }, [serverData]);

  return { draft, dirty, updateField, reset, setDirty };
}

interface EditableConfigProps {
  title: string;
  data: Record<string, unknown> | undefined;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: UseMutationResult<any, any, Record<string, unknown>, any>;
  filterKeys?: (key: string) => boolean;
  emptyMessage?: string;
}

function EditableConfigCard({
  title,
  data,
  isLoading,
  mutation,
  filterKeys,
  emptyMessage = "No configuration available.",
}: EditableConfigProps) {
  const { draft, dirty, updateField, reset } = useConfigDraft(data);

  if (isLoading) return <LoadingState />;
  if (!data) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;

  const entries = Object.entries(draft).filter(([k]) =>
    filterKeys ? filterKeys(k) : true
  );

  const handleSave = () => {
    mutation.mutate(draft, { onSuccess: () => reset() });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        {dirty && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={mutation.isPending}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map(([key, value]) => (
          <ConfigField
            key={key}
            fieldKey={key}
            value={value}
            onChange={(v) => updateField(key, v)}
          />
        ))}
        {mutation.isError && (
          <p className="text-sm text-destructive mt-2">
            Failed to save: {(mutation.error as Error)?.message ?? "Unknown error"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Individual field renderer
// ---------------------------------------------------------------------------

function ConfigField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between py-1.5 border-b last:border-0">
        <span className="text-sm font-mono">{fieldKey}</span>
        <button
          className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
          onClick={() => onChange(!value)}
        >
          {value ? "Enabled" : "Disabled"}
        </button>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="flex items-center justify-between gap-4 py-1.5 border-b last:border-0">
        <span className="text-sm font-mono text-muted-foreground shrink-0">{fieldKey}</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="max-w-[200px] h-8 text-sm"
        />
      </div>
    );
  }

  if (value === null || value === undefined) {
    return (
      <div className="flex items-center justify-between gap-4 py-1.5 border-b last:border-0">
        <span className="text-sm font-mono text-muted-foreground shrink-0">{fieldKey}</span>
        <Input
          value=""
          placeholder="null"
          onChange={(e) => onChange(e.target.value || null)}
          className="max-w-[300px] h-8 text-sm"
        />
      </div>
    );
  }

  if (typeof value === "string") {
    const isLong = value.length > 80 || value.includes("\n");
    if (isLong) {
      return (
        <div className="py-1.5 border-b last:border-0">
          <span className="text-sm font-mono text-muted-foreground mb-1.5 block">{fieldKey}</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={Math.min(Math.max(value.split("\n").length, 4), 20)}
            className="w-full rounded-md border border-input bg-muted p-2 text-xs font-mono resize-y"
          />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-4 py-1.5 border-b last:border-0">
        <span className="text-sm font-mono text-muted-foreground shrink-0">{fieldKey}</span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[300px] h-8 text-sm"
        />
      </div>
    );
  }

  // Object / array — JSON editor
  return <JsonField fieldKey={fieldKey} value={value} onChange={onChange} />;
}

function JsonField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  // Sync when value changes from parent (e.g. reset)
  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
    setError(null);
  }, [value]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="py-1.5 border-b last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-mono text-muted-foreground">{fieldKey}</span>
        {error && <span className="text-xs text-destructive">Invalid JSON</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        rows={Math.min(Math.max(text.split("\n").length, 3), 15)}
        className={`w-full rounded-md border bg-muted p-2 text-xs font-mono resize-y ${
          error ? "border-destructive" : "border-input"
        }`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function GeneralTab() {
  const { data, isLoading } = useDefaultModelsConfig();
  const mutation = useUpdateDefaultModelsConfig();

  return (
    <EditableConfigCard
      title="Default Models"
      data={data}
      isLoading={isLoading}
      mutation={mutation}
    />
  );
}

function RagTab() {
  const { data, isLoading } = useRagConfig();
  const mutation = useUpdateRagConfig();

  return (
    <EditableConfigCard
      title="RAG / Retrieval Configuration"
      data={data}
      isLoading={isLoading}
      mutation={mutation}
      filterKeys={(k) => k !== "status"}
      emptyMessage="No RAG configuration available."
    />
  );
}

function AuthTab() {
  const { data, isLoading } = useAuthConfig();
  const mutation = useUpdateAuthConfig();

  return (
    <EditableConfigCard
      title="Auth & Feature Flags"
      data={data}
      isLoading={isLoading}
      mutation={mutation}
      emptyMessage="No auth config available."
    />
  );
}

function BannersTab() {
  const { data: banners, isLoading } = useBanners();
  const updateBanners = useUpdateBanners();
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("info");

  if (isLoading) return <LoadingState />;

  const bannerList = Array.isArray(banners) ? banners : [];

  const addBanner = () => {
    if (!newContent.trim()) return;
    const banner = {
      id: crypto.randomUUID(),
      type: newType,
      title: null,
      content: newContent,
      dismissible: true,
      timestamp: Math.floor(Date.now() / 1000),
    };
    updateBanners.mutate([...bannerList, banner], {
      onSuccess: () => setNewContent(""),
    });
  };

  const removeBanner = (id: string) => {
    updateBanners.mutate(
      bannerList.filter((b: Record<string, unknown>) => b.id !== id)
    );
  };

  const updateBannerField = (id: string, field: string, value: unknown) => {
    updateBanners.mutate(
      bannerList.map((b: Record<string, unknown>) =>
        b.id === id ? { ...b, [field]: value } : b
      )
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {bannerList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active banners.</p>
          ) : (
            <div className="space-y-2">
              {bannerList.map((b: Record<string, unknown>) => (
                <div
                  key={b.id as string}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <select
                      value={b.type as string}
                      onChange={(e) =>
                        updateBannerField(b.id as string, "type", e.target.value)
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs shrink-0"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="success">Success</option>
                    </select>
                    <Input
                      value={b.content as string}
                      onChange={(e) =>
                        updateBannerField(b.id as string, "content", e.target.value)
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBanner(b.id as string)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <Label>Content</Label>
              <Input
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Banner message..."
              />
            </div>
          </div>
          <Button onClick={addBanner} disabled={updateBanners.isPending || !newContent.trim()}>
            {updateBanners.isPending ? "Saving..." : "Add Banner"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CodeTab() {
  const { data, isLoading } = useCodeExecutionConfig();
  const mutation = useUpdateCodeExecutionConfig();

  return (
    <EditableConfigCard
      title="Code Execution Configuration"
      data={data}
      isLoading={isLoading}
      mutation={mutation}
      emptyMessage="No code execution config available."
    />
  );
}
