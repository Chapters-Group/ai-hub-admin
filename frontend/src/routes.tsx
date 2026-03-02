import { createBrowserRouter } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyDetailPage } from "@/pages/CompanyDetailPage";
import { HealthMonitorPage } from "@/pages/HealthMonitorPage";
import { UsersPage } from "@/pages/UsersPage";
import { ModelsPage } from "@/pages/ModelsPage";
import { ModelEditPage } from "@/pages/ModelEditPage";
import { KnowledgePage } from "@/pages/KnowledgePage";
import { KnowledgeDetailPage } from "@/pages/KnowledgeDetailPage";
import { GroupsPage } from "@/pages/GroupsPage";
import { ConfigPage } from "@/pages/ConfigPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { FilesPage } from "@/pages/FilesPage";
import { PromptsPage } from "@/pages/PromptsPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { ProvisioningPage } from "@/pages/ProvisioningPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { CloneSyncPage } from "@/pages/CloneSyncPage";
import { ApiProxyPage } from "@/pages/ApiProxyPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "companies/:companyId", element: <CompanyDetailPage /> },
      { path: "health", element: <HealthMonitorPage /> },
      // Phase 2 — Core Management
      { path: "users", element: <UsersPage /> },
      { path: "models", element: <ModelsPage /> },
      { path: "models/:modelId", element: <ModelEditPage /> },
      { path: "knowledge", element: <KnowledgePage /> },
      { path: "knowledge/:kbId", element: <KnowledgeDetailPage /> },
      { path: "groups", element: <GroupsPage /> },
      // Phase 3 — Config & Insights
      { path: "config", element: <ConfigPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "files", element: <FilesPage /> },
      // Phase 4 — Platform Features
      { path: "prompts", element: <PromptsPage /> },
      { path: "tools", element: <ToolsPage /> },
      { path: "provisioning", element: <ProvisioningPage /> },
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "clone-sync", element: <CloneSyncPage /> },
      { path: "api-proxy", element: <ApiProxyPage /> },
      // Phase 5+ — placeholders
      { path: "auth-keys", element: <Placeholder title="Authentication Keys" /> },
    ],
  },
]);

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">Coming in a future phase.</p>
    </div>
  );
}
