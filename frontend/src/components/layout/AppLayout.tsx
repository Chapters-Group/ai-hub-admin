import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useCurrentUser } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const { isLoading } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
