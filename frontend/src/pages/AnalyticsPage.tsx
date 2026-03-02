import { useState, useMemo } from "react";
import {
  useAnalyticsSummary,
  useModelAnalytics,
  useUserAnalytics,
  useDailyStats,
  useTokenUsage,
} from "@/hooks/useAnalytics";
import { useCompanyStore } from "@/stores/companyStore";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, Users, Bot, Coins } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const COLORS = [
  "#3b82f6", "#06b6d4", "#6366f1", "#8b5cf6", "#d946ef",
  "#f43f5e", "#f59e0b", "#10b981", "#14b8a6", "#0ea5e9",
];

export function AnalyticsPage() {
  const company = useCompanyStore((s) => s.selectedCompany());

  const [days, setDays] = useState(30);

  // Stabilize dates so they only change when `days` changes, not on every render
  const { startDate, endDate } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return { startDate: now - days * 86400, endDate: now };
  }, [days]);

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(startDate, endDate);
  const { data: modelData, isLoading: modelsLoading } = useModelAnalytics(startDate, endDate);
  const { data: userData, isLoading: usersLoading } = useUserAnalytics(startDate, endDate);
  const { data: dailyData, isLoading: dailyLoading } = useDailyStats(startDate, endDate);
  const { data: tokenData, isLoading: tokensLoading } = useTokenUsage(startDate, endDate);

  const isLoading = summaryLoading || modelsLoading || usersLoading || dailyLoading || tokensLoading;

  // Transform daily data for AreaChart
  const chartData = useMemo(() => {
    if (!dailyData?.data) return [];
    return dailyData.data.map((d) => {
      const total = Object.values(d.models).reduce((sum, v) => sum + v, 0);
      return { date: d.date, Messages: total };
    });
  }, [dailyData]);

  // Transform model analytics for DonutChart
  const modelChartData = useMemo(() => {
    if (!modelData?.models) return [];
    return modelData.models
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((m) => ({
        name: m.model_id,
        value: m.count,
      }));
  }, [modelData]);

  // Transform user analytics for BarList
  const userBarData = useMemo(() => {
    if (!userData?.users) return [];
    return userData.users
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
      .map((u) => ({
        name: u.name || u.email || u.user_id,
        value: u.count,
      }));
  }, [userData]);

  // Token usage by model for BarList
  const tokenBarData = useMemo(() => {
    if (!tokenData?.models) return [];
    return tokenData.models
      .sort((a, b) => b.total_tokens - a.total_tokens)
      .slice(0, 10)
      .map((m) => ({
        name: m.model_id,
        value: m.total_tokens,
      }));
  }, [tokenData]);

  if (!company) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No company selected"
        description="Select a company from the sidebar to view analytics."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics — {company.name}</h1>
        <div className="flex gap-1 rounded-lg border p-1">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Messages"
              value={summary?.total_messages?.toLocaleString() ?? "—"}
              icon={MessageSquare}
            />
            <StatCard
              title="Total Chats"
              value={summary?.total_chats?.toLocaleString() ?? "—"}
              icon={MessageSquare}
            />
            <StatCard
              title="Active Models"
              value={summary?.total_models ?? "—"}
              icon={Bot}
            />
            <StatCard
              title="Active Users"
              value={summary?.total_users ?? "—"}
              icon={Users}
            />
          </div>

          {/* Token Summary */}
          {tokenData && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                title="Total Tokens"
                value={tokenData.total_tokens?.toLocaleString() ?? "—"}
                icon={Coins}
              />
              <StatCard
                title="Input Tokens"
                value={tokenData.total_input_tokens?.toLocaleString() ?? "—"}
                icon={Coins}
              />
              <StatCard
                title="Output Tokens"
                value={tokenData.total_output_tokens?.toLocaleString() ?? "—"}
                icon={Coins}
              />
            </div>
          )}

          {/* Daily Messages Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Messages Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={288}>
                  <ReAreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="Messages"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                    />
                  </ReAreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Model Usage */}
            {modelChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={modelChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {modelChartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Users */}
            {userBarData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Users by Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(userBarData.length * 32, 120)}>
                    <BarChart data={userBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={160}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Token Usage by Model */}
          {tokenBarData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Token Usage by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(tokenBarData.length * 32, 120)}>
                  <BarChart data={tokenBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
