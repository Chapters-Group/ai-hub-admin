import { useParams, useNavigate } from "react-router";
import { useKnowledgeDetail, useKnowledgeFiles, useUploadFileToKnowledge, useRemoveFileFromKnowledge, useResetKnowledge } from "@/hooks/useKnowledge";
import { useCompanyStore } from "@/stores/companyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ArrowLeft, FileText, Trash2, RotateCcw, BookOpen, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function KnowledgeDetailPage() {
  const { kbId } = useParams();
  const navigate = useNavigate();
  const company = useCompanyStore((s) => s.selectedCompany());
  const { data: kb, isLoading } = useKnowledgeDetail(kbId ?? null);
  const { data: kbFiles, isLoading: filesLoading } = useKnowledgeFiles(kbId ?? null);
  const uploadFile = useUploadFileToKnowledge(kbId ?? "");
  const removeFile = useRemoveFileFromKnowledge(kbId ?? "");
  const resetKB = useResetKnowledge(kbId ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  if (!company) return <EmptyState icon={BookOpen} title="No company selected" />;
  if (isLoading) return <LoadingState />;
  if (!kb) return <p>Knowledge base not found.</p>;

  const files = kbFiles ?? [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    for (let i = 0; i < selectedFiles.length; i++) {
      uploadFile.mutate(selectedFiles[i]);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/knowledge")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{kb.name}</h1>
          {kb.description && (
            <p className="text-sm text-muted-foreground">{kb.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
          <Upload className="mr-2 h-4 w-4" />
          {uploadFile.isPending ? "Uploading..." : "Upload Files"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          onClick={() => setShowReset(true)}
          disabled={resetKB.isPending}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Vectors for This KB
        </Button>
      </div>

      {uploadFile.isError && (
        <p className="text-sm text-destructive">
          {(uploadFile.error as any)?.response?.data?.detail
            ?? "Failed to upload file. Make sure the file format is supported."}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Files {filesLoading ? "(loading...)" : `(${files.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 && !filesLoading ? (
            <EmptyState
              icon={FileText}
              title="No files yet"
              description="Upload files to this knowledge base using the button above."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        {f.filename ?? f.id}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {f.id}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveTarget(f.id)}
                        title="Remove from KB"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
        title="Remove File"
        description="Remove this file from the knowledge base? The file itself won't be deleted."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (removeTarget) {
            removeFile.mutate(removeTarget, { onSuccess: () => setRemoveTarget(null) });
          }
        }}
        loading={removeFile.isPending}
      />

      <ConfirmDialog
        open={showReset}
        onOpenChange={setShowReset}
        title="Reset Knowledge Base"
        description="This will clear all vector embeddings for this specific knowledge base only. Other knowledge bases are not affected. Files will remain but need to be reprocessed. Continue?"
        confirmLabel="Reset"
        variant="destructive"
        onConfirm={() => resetKB.mutate(undefined, { onSuccess: () => setShowReset(false) })}
        loading={resetKB.isPending}
      />
    </div>
  );
}
