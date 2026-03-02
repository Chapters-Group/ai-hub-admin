import { useParams, useNavigate, Link } from "react-router";
import { useCompanyDetail, useTriggerHealthCheck } from "@/hooks/useCompanyApi";
import { useCompanyStore } from "@/stores/companyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  ArrowLeft,
  Users,
  Bot,
  BookOpen,
  UsersRound,
  HeartPulse,
  ExternalLink,
} from "lucide-react";
import { useEffect } from "react";

export function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const selectCompany = useCompanyStore((s) => s.selectCompany);
  const { data: company, isLoading } = useCompanyDetail(companyId ?? null);
  const triggerCheck = useTriggerHealthCheck();

  // Auto-select this company
  useEffect(() => {
    if (companyId) selectCompany(companyId);
  }, [companyId, selectCompany]);

  if (isLoading) return <LoadingState />;
  if (!company) return <p>Company not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/companies")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{company.slug}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Instance URL</p>
              <a
                href={company.instance_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline flex items-center gap-1"
              >
                {company.instance_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={company.status} />
                {company.version && (
                  <span className="text-muted-foreground">({company.version})</span>
                )}
              </div>
            </div>
            {company.contact_name && (
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p className="font-medium">{company.contact_name}</p>
              </div>
            )}
            {company.contact_email && (
              <div>
                <p className="text-muted-foreground">Contact Email</p>
                <p className="font-medium">{company.contact_email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Users"
          value={company.user_count ?? "-"}
          icon={Users}
        />
        <StatCard
          title="Models & Agents"
          value={company.model_count ?? "-"}
          icon={Bot}
        />
        <StatCard
          title="Knowledge Bases"
          value={company.knowledge_count ?? "-"}
          icon={BookOpen}
        />
        <StatCard
          title="Groups"
          value={company.group_count ?? "-"}
          icon={UsersRound}
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => triggerCheck.mutate(company.id)}
          disabled={triggerCheck.isPending}
        >
          <HeartPulse className="mr-2 h-4 w-4" />
          {triggerCheck.isPending ? "Checking..." : "Check Health"}
        </Button>
        <Button variant="outline" asChild>
          <a href={company.instance_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open WebUI
          </a>
        </Button>
      </div>
    </div>
  );
}
