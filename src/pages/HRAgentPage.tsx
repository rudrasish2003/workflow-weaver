import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "../api/axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CheckCircle, XCircle, Loader2, RotateCcw,
  Send, ChevronDown, ChevronRight, Bot, User, Sparkles,
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

const makeSessionId = () => `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── Workflow trace (shown only on completion) ─────────────────────────────────
function WorkflowTrace({ result }: { result: NonNullable<ApiMessage["workflow_result"]> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 rounded-xl border border-border overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
      >
        {open
          ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
        <Sparkles className="h-3 w-3 text-primary shrink-0" />
        <span className="text-[11px] font-medium text-muted-foreground">
          View workflow trace · {result.steps.length} step{result.steps.length !== 1 ? "s" : ""}
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

// ── Single message bubble ─────────────────────────────────────────────────────
function Message({ entry }: { entry: ChatEntry }) {
  const isUser = entry.role === "user";
  const isDone = entry.data?.status === "done";

  return (
    <div className={cn("flex gap-2.5 mb-5", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-muted border border-border text-muted-foreground"
      )}>
        {isUser
          ? <User className="h-3.5 w-3.5" />
          : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble + extras */}
      <div className={cn("max-w-[78%] min-w-0 flex flex-col", isUser && "items-end")}>
        <div className={cn(
          "px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm"
        )}>
          {entry.content}
        </div>

        {/* Only show trace when done */}
        {!isUser && isDone && entry.data?.workflow_result && (
          <div className="w-full mt-1 px-0.5">
            <WorkflowTrace result={entry.data.workflow_result} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Quick suggestion chips ────────────────────────────────────────────────────
const SUGGESTIONS = [
  "I'd like to work from home tomorrow",
  "Can I take leave next Monday to Wednesday?",
  "I'm not feeling well, need a sick day",
  "WFH request for EMP001 on 2026-05-01",
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HRAgentPage() {
  const [sessionId, setSessionId] = useState(makeSessionId);
  const [messages, setMessages]   = useState<ChatEntry[]>([
    {
      role: "assistant",
      content: "Hey! 👋 I'm Maya, your HR assistant. I can help you with WFH requests or leave applications. What do you need today?",
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

      if (data.status === "done") {
        setTimeout(() => setSessionId(makeSessionId()), 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hmm, I'm having trouble connecting right now. Could you try again in a moment?",
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
        content: "Starting fresh! What can I help you with?",
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
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">Maya</p>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-medium">Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 px-4 py-5">
        {messages.map((m, i) => <Message key={i} entry={m} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </ScrollArea>

      {/* ── Quick suggestions (only on fresh chat) ── */}
      {showSuggestions && (
        <div className="shrink-0 px-4 pb-2">
          <p className="text-[11px] text-muted-foreground mb-2 font-medium">Quick requests</p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs border border-border rounded-full px-3 py-1.5 bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-3 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message Maya…"
          rows={1}
          disabled={loading}
          className={cn(
            "flex-1 resize-none bg-muted/50 border border-input rounded-2xl px-4 py-2.5 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "min-h-[42px] max-h-[120px] overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors focus:bg-background"
          )}
          style={{ lineHeight: "1.5" }}
        />
        <Button
          size="sm"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="h-[42px] w-[42px] p-0 rounded-2xl shrink-0"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}