import { useState, useEffect } from "react";
import { useWorkflowStore } from "../../store/workflowStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, X, Plus, Brain, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MODELS = [
  { value: "gpt-4o",       label: "GPT-4o" },
  { value: "gpt-4o-mini",  label: "GPT-4o Mini" },
  { value: "gpt-4-turbo",  label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo",label: "GPT-3.5 Turbo" },
];

const OUTPUT_MODES = [
  {
    value: "text",
    label: "Text",
    desc: "Free-form text output added as __llm_output to payload",
  },
  {
    value: "json",
    label: "Structured JSON",
    desc: "Returns parsed JSON object merged into payload",
  },
  {
    value: "decision",
    label: "Decision (yes/no)",
    desc: "Routes to true/false handle based on LLM decision",
  },
];

const SCHEMA_EXAMPLES: Record<string, string> = {
  text: "",
  decision: `{"decision": "yes"|"no", "reason": "string"}`,
  json: `{
  "sentiment": "positive|negative|neutral",
  "score": 0.0,
  "summary": "string"
}`,
};

const SYSTEM_EXAMPLES: Record<string, string> = {
  text: "You are a helpful assistant. Summarize the data you receive.",
  json: "You are a data analyst. Analyze the input and return structured JSON only.",
  decision: "You are a decision engine. Based on the data, decide yes or no. Be concise.",
};

export function LLMEditSection() {
  const { selectedNodeId, nodes, edges, updateNodeData, removeNode, selectNode, removeEdge, addManualEdge } =
    useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  const [newTarget, setNewTarget] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setNewTarget("");
  }, [selectedNodeId]);

  if (!node || node.type !== "llmNode") return null;

  const d = node.data as any;
  const mode: string = d.outputMode || "text";
  const outgoingEdges = edges.filter((e) => e.source === node.id);
  const isDecision = mode === "decision";

  const upd = (patch: Record<string, any>) => updateNodeData(node.id, patch as any);

  const handleModeChange = (m: string) => {
    upd({
      outputMode: m,
      systemPrompt: SYSTEM_EXAMPLES[m] || d.systemPrompt,
      outputSchema: SCHEMA_EXAMPLES[m] || "",
    });
  };

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-violet-100 flex items-center justify-center">
            <Brain className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <h3 className="text-sm font-semibold">LLM Node</h3>
        </div>
        <button onClick={() => selectNode(null)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Label */}
          <div>
            <Label className="text-xs">Node label</Label>
            <Input
              value={d.label || ""}
              onChange={(e) => upd({ label: e.target.value })}
              className="mt-1 h-8 text-sm"
              placeholder="AI Reasoning"
            />
          </div>

          {/* Model */}
          <div>
            <Label className="text-xs">Model</Label>
            <Select value={d.llmModel || "gpt-4o"} onValueChange={(v) => upd({ llmModel: v })}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Output Mode */}
          <div>
            <Label className="text-xs">Output mode</Label>
            <div className="mt-1 space-y-1.5">
              {OUTPUT_MODES.map((om) => (
                <button
                  key={om.value}
                  onClick={() => handleModeChange(om.value)}
                  className={[
                    "w-full text-left p-2 rounded-lg border text-xs transition-colors",
                    mode === om.value
                      ? "border-violet-400 bg-violet-50 text-violet-900"
                      : "border-border bg-background text-foreground hover:border-violet-200 hover:bg-violet-50/50",
                  ].join(" ")}
                >
                  <span className="font-medium">{om.label}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{om.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* System prompt */}
          <div>
            <Label className="text-xs">System prompt</Label>
            <Textarea
              value={d.systemPrompt || ""}
              onChange={(e) => upd({ systemPrompt: e.target.value })}
              placeholder={SYSTEM_EXAMPLES[mode]}
              className="mt-1 text-xs min-h-[80px] resize-none"
            />
          </div>

          {/* User prompt / instructions */}
          <div>
            <Label className="text-xs">
              User prompt{" "}
              <span className="text-muted-foreground font-normal">(upstream payload always appended)</span>
            </Label>
            <Textarea
              value={d.userPrompt || ""}
              onChange={(e) => upd({ userPrompt: e.target.value })}
              placeholder="Analyze the data above and..."
              className="mt-1 text-xs min-h-[60px] resize-none"
            />
          </div>

          {/* JSON Schema (only for json/decision mode) */}
          {(mode === "json" || mode === "decision") && (
            <div>
              <Label className="text-xs">
                Output schema hint{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                value={d.outputSchema || ""}
                onChange={(e) => upd({ outputSchema: e.target.value })}
                placeholder={SCHEMA_EXAMPLES[mode]}
                className="mt-1 text-xs font-mono min-h-[80px] resize-none"
              />
              {mode === "decision" && (
                <p className="text-[10px] text-amber-600 mt-1">
                  The LLM must return <code>{"decision: \"yes\""}</code> or <code>{"\"no\""}</code> to route correctly.
                </p>
              )}
            </div>
          )}

          {/* Advanced */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {showAdvanced ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Advanced settings
            </button>
            {showAdvanced && (
              <div className="px-3 pb-3 space-y-3 border-t border-border pt-2">
                <div>
                  <Label className="text-xs">Temperature <span className="text-muted-foreground">({d.temperature ?? 0.3})</span></Label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={d.temperature ?? 0.3}
                    onChange={(e) => upd({ temperature: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Precise (0)</span>
                    <span>Creative (1)</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Max tokens</Label>
                  <Input
                    type="number"
                    min={50}
                    max={4096}
                    value={d.maxTokens ?? 500}
                    onChange={(e) => upd({ maxTokens: parseInt(e.target.value) || 500 })}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Connections */}
          <div className="pt-3 mt-1 border-t border-border space-y-2">
            <Label className="text-xs font-semibold">Connections (outgoing)</Label>

            {outgoingEdges.map((edge) => {
              const targetNode = nodes.find((n) => n.id === edge.target);
              const handleLabel =
                edge.sourceHandle === "true"  ? "Yes path"
                : edge.sourceHandle === "false" ? "No path"
                : "Next";
              return (
                <div
                  key={edge.id}
                  className="flex items-center justify-between bg-muted/50 border border-border p-2 rounded-md text-xs"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground">
                      {handleLabel}
                    </span>
                    <span className="truncate font-medium text-foreground">
                      {targetNode?.data.label || "Unknown"}
                    </span>
                  </div>
                  <button
                    onClick={() => removeEdge(edge.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Add connection */}
            <div className="flex gap-1.5 items-end">
              {isDecision && (
                <Select
                  value={newTarget ? (outgoingEdges.length === 0 ? "true" : "false") : "true"}
                  onValueChange={() => {}}
                >
                  <SelectTrigger className="h-8 text-xs w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={newTarget} onValueChange={setNewTarget}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Connect to…" />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter((n) => n.id !== node.id && !n.type?.includes("start"))
                    .map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.data.label || n.type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2.5 shrink-0"
                disabled={!newTarget}
                onClick={() => {
                  const handle = isDecision
                    ? outgoingEdges.some((e) => e.sourceHandle === "true") ? "false" : "true"
                    : "out";
                  addManualEdge(node.id, newTarget, handle);
                  setNewTarget("");
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Delete */}
      <div className="p-3 border-t border-border">
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-1.5 text-xs"
          onClick={() => { removeNode(node.id); selectNode(null); }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete Node
        </Button>
      </div>
    </div>
  );
}