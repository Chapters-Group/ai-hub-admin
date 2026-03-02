import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
