import { useState } from "react";
import { useCreateUser } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shuffle } from "lucide-react";

interface UserFormProps {
  onSuccess: () => void;
}

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("");
}

export function UserForm({ onSuccess }: UserFormProps) {
  const createUser = useCreateUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [role, setRole] = useState("user");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({ name, email, password, role }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="userName">Name</Label>
        <Input
          id="userName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Max Müller"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userEmail">Email</Label>
        <Input
          id="userEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="m.muller@company.de"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userPassword">Password</Label>
        <div className="flex gap-2">
          <Input
            id="userPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPassword(generatePassword())}
            title="Generate password"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="userRole">Role</Label>
        <select
          id="userRole"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      {createUser.isError && (
        <p className="text-sm text-destructive">
          Failed to create user. The email might already exist.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={createUser.isPending}>
        {createUser.isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
