import { useCompanyStore } from "@/stores/companyStore";
import { useCompanies } from "@/hooks/useCompanyApi";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  slow: "bg-yellow-500",
  offline: "bg-red-500",
  unknown: "bg-gray-400",
};

export function CompanySelector() {
  const { data: companies } = useCompanies();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const selectCompany = useCompanyStore((s) => s.selectCompany);

  const selected = companies?.find((c) => c.id === selectedCompanyId);

  return (
    <div className="relative">
      <select
        value={selectedCompanyId ?? ""}
        onChange={(e) => selectCompany(e.target.value)}
        className="flex h-9 w-full appearance-none rounded-md border border-sidebar-border bg-sidebar-background pl-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="" disabled>
          Select a company...
        </option>
        {companies?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
      {selected && (
        <span
          className={cn(
            "absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full",
            statusColors[selected.status] ?? statusColors.unknown
          )}
        />
      )}
    </div>
  );
}
