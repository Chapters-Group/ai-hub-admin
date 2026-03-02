import { StatCard } from "@/components/shared/StatCard";
import { useHealthSummary, useCompanies } from "@/hooks/useCompanyApi";
import { Building2, Users, HeartPulse, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";

export function DashboardPage() {
  const { data: health, isLoading: healthLoading } = useHealthSummary();
  const { data: companies, isLoading: companiesLoading } = useCompanies();

  if (healthLoading || companiesLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={companies?.length ?? 0}
          icon={Building2}
        />
        <StatCard
          title="Online"
          value={health?.online ?? 0}
          icon={HeartPulse}
          description={`of ${health?.total ?? 0} instances`}
        />
        <StatCard
          title="Slow"
          value={health?.slow ?? 0}
          icon={AlertTriangle}
        />
        <StatCard
          title="Offline"
          value={health?.offline ?? 0}
          icon={AlertTriangle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instance Status</CardTitle>
        </CardHeader>
        <CardContent>
          {health?.statuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No companies registered yet. Add one from the Companies page.
            </p>
          ) : (
            <div className="space-y-3">
              {health?.statuses.map((s) => (
                <div
                  key={s.company_id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{s.company_name}</p>
                    <p className="text-xs text-muted-foreground">{s.instance_url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {s.response_time_ms !== null && (
                      <span className="text-xs text-muted-foreground">
                        {s.response_time_ms}ms
                      </span>
                    )}
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
