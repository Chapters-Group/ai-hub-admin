import { useState } from "react";
import { useCreateCompany, useCompanies } from "@/hooks/useCompanyApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

export function ProvisioningPage() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const createCompany = useCreateCompany();

  const steps = [
    { num: 1, label: "Company Info" },
    { num: 2, label: "Instance Connection" },
    { num: 3, label: "Contact Details" },
    { num: 4, label: "Review & Create" },
  ];

  const canNext = () => {
    if (step === 1) return name.trim() && slug.trim();
    if (step === 2) return instanceUrl.trim() && apiKey.trim();
    return true;
  };

  const handleCreate = () => {
    setError(null);
    createCompany.mutate(
      {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        instance_url: instanceUrl,
        api_key: apiKey,
        contact_name: contactName || undefined,
        contact_email: contactEmail || undefined,
      },
      {
        onSuccess: (data) => setCreatedId(data.id),
        onError: (err: Error) => setError(err.message),
      }
    );
  };

  const handleReset = () => {
    setStep(1);
    setName("");
    setSlug("");
    setInstanceUrl("");
    setApiKey("");
    setContactName("");
    setContactEmail("");
    setError(null);
    setCreatedId(null);
  };

  // Success state
  if (createdId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Provisioning</h1>
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Instance Registered!</h2>
            <p className="text-muted-foreground mb-6">
              <strong>{name}</strong> has been added to the admin panel. Health
              checks will begin automatically.
            </p>
            <Button onClick={handleReset}>Register Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Provisioning</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s.num
                  ? "bg-primary text-primary-foreground"
                  : step > s.num
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
            </div>
            <span className="ml-2 text-sm hidden sm:inline">{s.label}</span>
            {i < steps.length - 1 && (
              <div className="mx-3 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{steps[step - 1].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-1">
                <Label>Company Name</Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="Bletec GmbH"
                />
              </div>
              <div className="space-y-1">
                <Label>Slug (URL identifier)</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="bletec"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1">
                <Label>Instance URL</Label>
                <Input
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  placeholder="https://bletec.chat.chaptersgroup.com"
                />
                <p className="text-xs text-muted-foreground">
                  The full URL of the Open WebUI instance (including https://).
                </p>
              </div>
              <div className="space-y-1">
                <Label>Admin API Key</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground">
                  An admin-level API key from the target instance.
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-1">
                <Label>Contact Name (optional)</Label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <Label>Contact Email (optional)</Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="rounded-md border p-4 space-y-2">
                <Row label="Company" value={name} />
                <Row label="Slug" value={slug} />
                <Row label="Instance URL" value={instanceUrl} />
                <Row label="API Key" value={`${apiKey.slice(0, 8)}...`} />
                {contactName && <Row label="Contact" value={contactName} />}
                {contactEmail && <Row label="Email" value={contactEmail} />}
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setStep((s) => (s - 1) as Step)}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canNext()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={createCompany.isPending}>
                {createCompany.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Register Instance
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
