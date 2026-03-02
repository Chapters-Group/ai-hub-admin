import { cn } from "@/lib/utils";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  online: { color: "text-green-700", bg: "bg-green-100", label: "Online" },
  slow: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Slow" },
  offline: { color: "text-red-700", bg: "bg-red-100", label: "Offline" },
  unknown: { color: "text-gray-700", bg: "bg-gray-100", label: "Unknown" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.unknown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.color
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-green-500": status === "online",
          "bg-yellow-500": status === "slow",
          "bg-red-500": status === "offline",
          "bg-gray-400": status === "unknown",
        })}
      />
      {config.label}
    </span>
  );
}
