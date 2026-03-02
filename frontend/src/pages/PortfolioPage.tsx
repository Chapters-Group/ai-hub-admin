import { useMemo } from "react";
import { useCompanies, useHealthSummary } from "@/hooks/useCompanyApi";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, HeartPulse, AlertTriangle, Wifi } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  online: "#22c55e",
  slow: "#f59e0b",
  offline: "#ef4444",
  unknown: "#94a3b8",
};

export function PortfolioPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: health, isLoading: healthLoading } = useHealthSummary();

  const isLoading = companiesLoading || healthLoading;

  const statusChartData = useMemo(() => {
    if (!health) return [];
    return [
      { name: "Online", value: health.online, color: STATUS_COLORS.online },
      { name: "Slow", value: health.slow, color: STATUS_COLORS.slow },
      { name: "Offline", value: health.offline, color: STATUS_COLORS.offline },
      { name: "Unknown", value: health.unknown, color: STATUS_COLORS.unknown },
    ].filter((d) => d.value > 0);
  }, [health]);

  const responseTimeData = useMemo(() => {
    if (!health?.statuses) return [];
    return health.statuses
      .filter((s) => s.response_time_ms !== null)
      .sort((a, b) => (b.response_time_ms ?? 0) - (a.response_time_ms ?? 0))
      .slice(0, 20)
      .map((s) => ({
        name: s.company_name,
        value: s.response_time_ms ?? 0,
      }));
  }, [health]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Portfolio Overview</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Instances"
          value={companies?.length ?? 0}
          icon={Building2}
        />
        <StatCard
          title="Online"
          value={health?.online ?? 0}
          icon={Wifi}
          description={`of ${health?.total ?? 0}`}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        {statusChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {statusChartData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Response Times */}
        {responseTimeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Times (ms)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer
                width="100%"
                height={Math.max(responseTimeData.length * 28, 120)}
              >
                <BarChart data={responseTimeData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instance List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Instances</CardTitle>
        </CardHeader>
        <CardContent>
          {!health?.statuses || health.statuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No instances registered.</p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                <span>Instance</span>
                <span>Status</span>
                <span>Response</span>
                <span>Version</span>
                <span>Checked</span>
              </div>
              {health.statuses.map((s) => (
                <div
                  key={s.company_id}
                  className="grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 items-center px-3 py-2 rounded-md hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{s.company_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.instance_url}</p>
                  </div>
                  <StatusBadge status={s.status} />
                  <span className="text-sm text-muted-foreground">
                    {s.response_time_ms !== null ? `${s.response_time_ms}ms` : "—"}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {s.version ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.last_checked
                      ? new Date(s.last_checked).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
