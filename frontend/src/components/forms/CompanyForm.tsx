import { useState } from "react";
import { useCreateCompany } from "@/hooks/useCompanyApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyFormProps {
  onSuccess: () => void;
}

export function CompanyForm({ onSuccess }: CompanyFormProps) {
  const createCompany = useCreateCompany();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug from name
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany.mutate(
      {
        name,
        slug,
        instance_url: instanceUrl,
        api_key: apiKey,
        contact_name: contactName || undefined,
        contact_email: contactEmail || undefined,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="BleTec GmbH"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="bletec"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">Instance URL</Label>
        <Input
          id="url"
          type="url"
          value={instanceUrl}
          onChange={(e) => setInstanceUrl(e.target.value)}
          placeholder="https://bletec.chat.chaptersgroup.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>
      {createCompany.isError && (
        <p className="text-sm text-destructive">
          Failed to add company. Check the URL and API key.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={createCompany.isPending}>
        {createCompany.isPending ? "Connecting..." : "Add Company"}
      </Button>
    </form>
  );
}
