import { useState } from "react";
import { useCreateGroup } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OWUIUser } from "@/lib/types";

interface GroupFormProps {
  users: OWUIUser[];
  onSuccess: () => void;
}

export function GroupForm({ users, onSuccess }: GroupFormProps) {
  const createGroup = useCreateGroup();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate(
      {
        name,
        description: description || undefined,
        user_ids: Array.from(selectedUserIds),
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="groupName">Group Name</Label>
        <Input
          id="groupName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="IT Team"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="groupDesc">Description</Label>
        <Input
          id="groupDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      {users.length > 0 && (
        <div className="space-y-2">
          <Label>Members</Label>
          <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-1">
            {users.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2 rounded p-1.5 hover:bg-muted cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.has(u.id)}
                  onChange={() => toggleUser(u.id)}
                  className="rounded"
                />
                <span className="font-medium">{u.name}</span>
                <span className="text-muted-foreground">{u.email}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedUserIds.size} user{selectedUserIds.size !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
      {createGroup.isError && (
        <p className="text-sm text-destructive">Failed to create group.</p>
      )}
      <Button type="submit" className="w-full" disabled={createGroup.isPending}>
        {createGroup.isPending ? "Creating..." : "Create Group"}
      </Button>
    </form>
  );
}
