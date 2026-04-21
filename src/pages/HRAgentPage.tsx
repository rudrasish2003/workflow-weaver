import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "../api/axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CheckCircle, XCircle, Loader2, RotateCcw,
  Send, ChevronDown, ChevronRight, Bot, User,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ApiMessage {
  reply: string;
  status: "thinking" | "collecting" | "executing" | "done" | "error";
  workflow_result?: {
    steps: { label: string; payload: any; status: number }[];
    final: any;
  } | null;
  collected?: Record<string, string> | null;
}

interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  data?: ApiMessage;
}

// ── API ───────────────────────────────────────────────────────────────────────
const agentApi = {
  chat: (session_id: string, message: string) =>
    apiClient
      .post<ApiMessage>("/api/agent/chat", { session_id, message })
      .then((r) => r.data),
  reset: (session_id: string) =>
    apiClient.delete(`/api/agent/session/${session_id}`),
};

// ── Session ID ────────────────────────────────────────────────────────────────
const makeSessionId = () => `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    collecting: { label: "Gathering info", cls: "bg-amber-100 text-amber-700" },
    executing:  { label: "Executing",      cls: "bg-blue-100 text-blue-700" },
    done:       { label: "Completed",      cls: "bg-emerald-100 text-emerald-700" },
    error:      { label: "Error",          cls: "bg-red-100 text-red-700" },
  };
  const c = map[status];
  if (!c) return null;
  return (
    <span className={cn("mt-1.5 inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", c.cls)}>
      {c.label}
    </span>
  );
}

function CollectedBadges({ collected }: { collected: Record<string, string> }) {
  if (!Object.keys(collected).length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {Object.entries(collected).map(([k, v]) => (
        <span key={k} className="inline-flex items-center gap-1 text-[11px] bg-muted border border-border rounded-md px-2 py-0.5">
          <span className="text-muted-foreground">{k}:</span>
          <span className="font-medium text-foreground">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

function WorkflowTrace({ result }: { result: NonNullable<ApiMessage["workflow_result"]> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-lg border border-border overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        <span className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
          Workflow trace ({result.steps.length} step{result.steps.length !== 1 ? "s" : ""})
        </span>
      </button>
      {open && (
        <div className="divide-y divide-border">
          {result.steps.map((step, i) => (
            <div key={i} className="flex gap-3 px-3 py-2.5 bg-card">
              <div className={cn(
                "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                step.status < 300 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              )}>
                {step.status < 300
                  ? <CheckCircle className="h-3 w-3" />
                  : <XCircle className="h-3 w-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-xs">{step.label}</p>
                <pre className="mt-1 text-[10px] text-muted-foreground bg-muted rounded p-1.5 overflow-x-auto max-h-28 font-mono">
                  {JSON.stringify(step.payload, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Message({ entry }: { entry: ChatEntry }) {
  const isUser = entry.role === "user";
  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
        isUser
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border"
      )}>
        {isUser
          ? <User className="h-3.5 w-3.5" />
          : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[78%] min-w-0", isUser && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-tl-sm"
        )}>
          {entry.content}
        </div>

        {/* Assistant extras */}
        {!isUser && entry.data && (
          <div className="px-1">
            <StatusPill status={entry.data.status} />
            {entry.data.collected && Object.keys(entry.data.collected).length > 0 && (
              <CollectedBadges collected={entry.data.collected} />
            )}
            {entry.data.workflow_result && (
              <WorkflowTrace result={entry.data.workflow_result} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
          />
        ))}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "I want to apply for WFH tomorrow",
  "I need leave from next Monday to Wednesday",
  "Apply WFH for EMP001 on 2026-05-01",
  "I'd like to take a sick day",
];

// ── Main component ────────────────────────────────────────────────────────────
export default function HRAgentPage() {
  const [sessionId, setSessionId] = useState(makeSessionId);
  const [messages, setMessages]   = useState<ChatEntry[]>([
    {
      role: "assistant",
      content: "Hi! I'm your HR assistant. I can help you apply for Work From Home or Leave. What do you need today?",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const data = await agentApi.chat(sessionId, msg);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, data },
      ]);

      // If done, auto-reset session after short delay so next message starts fresh
      if (data.status === "done") {
        setTimeout(() => setSessionId(makeSessionId()), 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect to the server. Please make sure the backend is running.",
          data: { reply: "", status: "error" },
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [input, loading, sessionId]);

  const reset = async () => {
    try { await agentApi.reset(sessionId); } catch {}
    setSessionId(makeSessionId());
    setMessages([
      {
        role: "assistant",
        content: "Session reset! How can I help you?",
      },
    ]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ── Header ── */}
      <div className="shrink-0 h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">HR Assistant</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">WFH &amp; Leave requests</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.map((m, i) => <Message key={i} entry={m} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </ScrollArea>

      {/* ── Suggestions ── */}
      {showSuggestions && (
        <div className="shrink-0 px-4 pb-2 flex gap-2 flex-wrap">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs border border-border rounded-full px-3 py-1.5 bg-card text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-3 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your request…  (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={loading}
          className={cn(
            "flex-1 resize-none bg-background border border-input rounded-xl px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "min-h-[38px] max-h-[120px] overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          style={{ lineHeight: "1.5" }}
        />
        <Button
          size="sm"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="h-[38px] px-3 rounded-xl shrink-0"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}