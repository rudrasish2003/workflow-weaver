import { useState } from "react";
import { useExecution } from "../../hooks/useExecution";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Square, ChevronDown, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  workflowId: string | null;
}

export function ExecutionPanel({ workflowId }: Props) {
  const { state, isRunning, run, stop } = useExecution(workflowId);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const toggleLog = (i: number) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const statusColor = {
    running: "bg-blue-500",
    completed: "bg-emerald-500",
    error: "bg-destructive",
    stopped: "bg-muted-foreground",
    idle: "bg-muted-foreground",
  };

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Execution</h3>
        {state && (
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", statusColor[state.status])} />
            <span className="text-xs text-muted-foreground capitalize">{state.status}</span>
          </div>
        )}
      </div>

      {/* Run / Stop controls */}
      <div className="p-3 border-b border-border flex gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={() => run()}
          disabled={isRunning || !workflowId}
        >
          {isRunning
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running...</>
            : <><Play className="h-3.5 w-3.5" /> Run Workflow</>
          }
        </Button>
        {isRunning && (
          <Button size="sm" variant="destructive" onClick={stop} className="gap-1.5 text-xs">
            <Square className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {!state && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Run a workflow to see execution logs
            </p>
          )}

          {state?.logs.map((log, i) => (
            <div
              key={i}
              className={cn(
                "rounded-md border text-xs overflow-hidden",
                log.status === "error" ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"
              )}
            >
              {/* Log header row */}
              <button
                className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/50 transition-colors"
                onClick={() => toggleLog(i)}
              >
                {log.status === "ok"
                  ? <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  : <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                }
                <span className="font-medium flex-1 truncate">{log.label}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {expandedLogs.has(i)
                  ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                  : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                }
              </button>

              {/* Payload expandable */}
              {expandedLogs.has(i) && (
                <div className="px-2 pb-2">
                  <pre className="text-[10px] bg-background rounded p-2 overflow-x-auto max-h-40 border border-border text-muted-foreground">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {/* Running indicator */}
          {isRunning && (
            <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Executing next node...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}