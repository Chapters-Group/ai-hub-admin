import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Bot,
  BookOpen,
  UsersRound,
  FileText,
  Wrench,
  Settings,
  BarChart3,
  FolderOpen,
  Rocket,
  TrendingUp,
  Link2,
  HeartPulse,
  Copy,
  MessageSquare,
} from "lucide-react";
import { CompanySelector } from "./CompanySelector";

const globalNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/companies", icon: Building2, label: "Companies" },
];

const companyNav = [
  { to: "/users", icon: Users, label: "Users" },
  { to: "/models", icon: Bot, label: "Models & Agents" },
  { to: "/knowledge", icon: BookOpen, label: "Knowledge Bases" },
  { to: "/groups", icon: UsersRound, label: "Groups & Permissions" },
  { to: "/prompts", icon: FileText, label: "Prompts & Templates" },
  { to: "/tools", icon: Wrench, label: "Tools & Functions" },
  { to: "/config", icon: Settings, label: "Configuration" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/files", icon: FolderOpen, label: "Files" },
  { to: "/api-proxy", icon: MessageSquare, label: "Chat Playground" },
];

const platformNav = [
  { to: "/provisioning", icon: Rocket, label: "Provisioning" },
  { to: "/portfolio", icon: TrendingUp, label: "Portfolio Overview" },
  { to: "/clone-sync", icon: Copy, label: "Clone & Sync" },
  { to: "/health", icon: HeartPulse, label: "Health Monitor" },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-sidebar-background">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-bold text-sidebar-foreground">CHAPTERS AI Hub</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div className="space-y-1">
          {globalNav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Current Company
          </p>
          <div className="px-1 mb-3">
            <CompanySelector />
          </div>
          <div className="space-y-1">
            {companyNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Platform
          </p>
          <div className="space-y-1">
            {platformNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
