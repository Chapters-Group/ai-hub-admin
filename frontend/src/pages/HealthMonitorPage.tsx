import { useHealthSummary, useTriggerHealthCheck } from "@/hooks/useCompanyApi";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { HeartPulse, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function HealthMonitorPage() {
  const { data: health, isLoading, refetch } = useHealthSummary();
  const triggerCheck = useTriggerHealthCheck();

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Health Monitor</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Auto-refresh: 60s</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={health?.total ?? 0} icon={HeartPulse} />
        <StatCard title="Online" value={health?.online ?? 0} icon={CheckCircle} />
        <StatCard title="Slow" value={health?.slow ?? 0} icon={AlertTriangle} />
        <StatCard title="Offline" value={health?.offline ?? 0} icon={XCircle} />
      </div>

      {health?.statuses.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No instances registered"
          description="Add companies from the Companies page to start monitoring."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {health?.statuses.map((s) => (
                <TableRow key={s.company_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.company_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {s.instance_url}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {s.response_time_ms !== null ? `${s.response_time_ms}ms` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.version ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.last_checked
                      ? formatDistanceToNow(new Date(s.last_checked), { addSuffix: true })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => triggerCheck.mutate(s.company_id)}
                      disabled={triggerCheck.isPending}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
