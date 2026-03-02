import { useState, useRef } from "react";
import { useFiles, useUploadFile, useDeleteFile } from "@/hooks/useFiles";
import type { OWUIFile } from "@/hooks/useFiles";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { FolderOpen, Upload, Trash2, Search, FileText, FileSpreadsheet, FileImage, File } from "lucide-react";
import { format } from "date-fns";

function fileIcon(contentType?: string) {
  if (!contentType) return File;
  if (contentType.startsWith("image/")) return FileImage;
  if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType.includes("csv"))
    return FileSpreadsheet;
  if (contentType.includes("text") || contentType.includes("pdf") || contentType.includes("document"))
    return FileText;
  return File;
}

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: files, isLoading } = useFiles();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!company) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No company selected"
        description="Select a company from the sidebar to manage files."
      />
    );
  }

  if (isLoading) return <LoadingState />;

  const fileList = files ?? [];
  const filtered = search.trim()
    ? fileList.filter((f) => {
        const name = f.meta?.name || f.filename || "";
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : fileList;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    for (const file of Array.from(selectedFiles)) {
      await uploadFile.mutateAsync(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId);
    try {
      await deleteFile.mutateAsync(fileId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Files — {company.name}</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFile.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadFile.isPending ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={search ? "No files match your search" : "No files uploaded"}
          description={search ? "Try a different search term." : "Upload files to get started."}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {filtered.length} file{filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_100px_80px_48px] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                <span>Name</span>
                <span>Type</span>
                <span>Size</span>
                <span>Date</span>
                <span />
              </div>
              {filtered.map((f: OWUIFile) => {
                const Icon = fileIcon(f.meta?.content_type);
                const name = f.meta?.name || f.filename || f.id;
                return (
                  <div
                    key={f.id}
                    className="grid grid-cols-[1fr_120px_100px_80px_48px] gap-4 items-center px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm truncate" title={name}>
                        {name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {f.meta?.content_type?.split("/").pop() ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatSize(f.meta?.size)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {f.created_at
                        ? format(new Date(f.created_at * 1000), "MMM d")
                        : "—"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(f.id)}
                      disabled={deletingId === f.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
