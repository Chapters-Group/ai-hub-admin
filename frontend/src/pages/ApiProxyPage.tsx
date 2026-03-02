import { useState, useRef, useEffect } from "react";
import { useCompanyStore } from "@/stores/companyStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Link2, Send, Loader2, Trash2, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  selectedModel?: string; // custom model the user picked
  baseModel?: string;     // underlying model from the API response
}

export function ApiProxyPage() {
  const company = useCompanyStore((s) => s.selectedCompany());
  const companyId = useCompanyStore((s) => s.selectedCompanyId);

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ["chat-models", companyId],
    queryFn: async () => {
      const res = await api.get(`/api/companies/${companyId}/chat/models`);
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      return list as { id: string; name: string }[];
    },
    enabled: !!companyId,
  });

  const [modelId, setModelId] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first model
  useEffect(() => {
    if (modelsData && modelsData.length > 0 && !modelId) {
      setModelId(modelsData[0].id);
    }
  }, [modelsData, modelId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!company) {
    return (
      <EmptyState
        icon={Link2}
        title="No company selected"
        description="Select a company from the sidebar to use the chat playground."
      />
    );
  }

  if (modelsLoading) return <LoadingState />;

  const modelName = (id: string) => {
    const m = modelsData?.find((m) => m.id === id);
    return m?.name || id;
  };

  const handleSend = async () => {
    if (!userInput.trim() || !modelId || isStreaming) return;

    const currentModel = modelId;
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsStreaming(true);

    // Build the message list for the API (strip model metadata)
    const apiMessages = [];
    if (systemPrompt.trim()) {
      apiMessages.push({ role: "system" as const, content: systemPrompt });
    }
    for (const m of newMessages) {
      apiMessages.push({ role: m.role, content: m.content });
    }

    // Add empty assistant message to stream into
    setMessages([...newMessages, { role: "assistant", content: "", selectedModel: currentModel }]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/companies/${companyId}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: currentModel,
            messages: apiMessages,
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let responseModel = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (!responseModel && parsed.model) {
              responseModel = parsed.model;
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                  selectedModel: currentModel,
                  baseModel: responseModel || undefined,
                };
                return updated;
              });
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Error: ${(err as Error).message}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chat Playground — {company.name}</h1>

      {/* System Prompt */}
      <div className="space-y-1">
        <Label>System Prompt (optional)</Label>
        <Input
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful assistant..."
        />
      </div>

      {/* Chat Area */}
      <Card className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 300 }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
          <CardTitle className="text-lg">Conversation</CardTitle>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Select a model below and send a message to start chatting.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] ${m.role === "assistant" ? "space-y-1" : ""}`}>
                    {m.role === "assistant" && m.selectedModel && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Bot className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {modelName(m.selectedModel)}
                        </span>
                        {m.baseModel && m.baseModel !== m.selectedModel && (
                          <span className="text-xs text-muted-foreground/60">
                            ({m.baseModel})
                          </span>
                        )}
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {m.content || (isStreaming && i === messages.length - 1 ? "..." : "")}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        {/* Input pinned at bottom of card */}
        <div className="shrink-0 border-t p-4">
          <div className="flex gap-2">
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              disabled={isStreaming}
              className="h-10 shrink-0 rounded-md border border-input bg-background px-2 text-sm max-w-[200px]"
              title="Select model for next message"
            >
              {(modelsData ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.id}
                </option>
              ))}
            </select>
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              disabled={isStreaming}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isStreaming || !userInput.trim()}>
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
