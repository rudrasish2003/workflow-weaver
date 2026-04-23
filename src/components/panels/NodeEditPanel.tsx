import { useState, useEffect } from "react";
import { useWorkflowStore } from "../../store/workflowStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, X, Plus } from "lucide-react";
import { LLMEditSection } from "./LLMEditSection";

export function NodeEditPanel() {
  const {
    selectedNodeId,
    nodes,
    edges,
    updateNodeData,
    removeNode,
    selectNode,
    removeEdge,
    addManualEdge,
  } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  const [newTarget, setNewTarget] = useState<string>("");
  const [newHandle, setNewHandle] = useState<string>("out");
  const baseType = node?.type?.replace("Node", "") as string;

  useEffect(() => {
    setNewTarget("");
    if (baseType === "condition") setNewHandle("true");
    else setNewHandle("out");
  }, [selectedNodeId, baseType]);

  if (!node) return null;

  // ── Route LLM nodes to dedicated panel ───────────────────────────────────
  if (node.type === "llmNode") return <LLMEditSection />;

  const outgoingEdges = edges.filter((e) => e.source === node.id);

  const handleConditionChange = (updates: Partial<typeof node.data>) => {
    const newData = { ...node.data, ...updates };
    let condStr = newData.conditionVariable || "";
    const op = newData.conditionOperator;
    if (op) {
      if (op === "exists") condStr += " exists";
      else if (op === "not_exists") condStr += " doesn't exist";
      else condStr += ` ${op} ${newData.conditionValue || ""}`;
    }
    updateNodeData(node.id, { ...updates, condition: condStr.trim() });
  };

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Edit Node</h3>
        <button onClick={() => selectNode(null)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <Label className="text-xs">Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
            className="mt-1 h-8 text-sm"
          />
        </div>

        {baseType === "api" && (
          <>
            <div>
              <Label className="text-xs">Method</Label>
              <Select
                value={node.data.method ?? "GET"}
                onValueChange={(v) => updateNodeData(node.id, { method: v as any })}
              >
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["GET", "POST", "PUT", "DELETE"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={node.data.url ?? ""}
                onChange={(e) => updateNodeData(node.id, { url: e.target.value })}
                placeholder="https://api.example.com"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Headers (JSON)</Label>
              <Textarea
                value={node.data.headers ? JSON.stringify(node.data.headers, null, 2) : ""}
                onChange={(e) => {
                  try { updateNodeData(node.id, { headers: JSON.parse(e.target.value) }); } catch {}
                }}
                placeholder='{"Authorization": "Bearer ..."}'
                className="mt-1 text-xs font-mono min-h-[60px]"
              />
            </div>
            <div>
              <Label className="text-xs">Body (JSON)</Label>
              <Textarea
                value={node.data.body ? JSON.stringify(node.data.body, null, 2) : ""}
                onChange={(e) => {
                  try { updateNodeData(node.id, { body: JSON.parse(e.target.value) }); } catch {}
                }}
                placeholder='{"key": "value"}'
                className="mt-1 text-xs font-mono min-h-[60px]"
              />
            </div>
          </>
        )}

        {baseType === "condition" && (
          <div className="space-y-3 bg-muted/50 p-2.5 rounded-lg border border-border">
            <div>
              <Label className="text-xs">Variable to check</Label>
              <Input
                value={node.data.conditionVariable ?? ""}
                onChange={(e) => handleConditionChange({ conditionVariable: e.target.value })}
                placeholder="e.g. status_code"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Operator</Label>
              <Select
                value={node.data.conditionOperator ?? ""}
                onValueChange={(v) => handleConditionChange({ conditionOperator: v as any })}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exists">Exists</SelectItem>
                  <SelectItem value="not_exists">Does not exist</SelectItem>
                  <SelectItem value="==">Equals (==)</SelectItem>
                  <SelectItem value="!=">Not Equals (!=)</SelectItem>
                  <SelectItem value=">">Greater than (&gt;)</SelectItem>
                  <SelectItem value="<">Less than (&lt;)</SelectItem>
                  <SelectItem value=">=">Greater or Equal (&gt;=)</SelectItem>
                  <SelectItem value="<=">Less or Equal (&lt;=)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!["exists", "not_exists"].includes(node.data.conditionOperator || "") && (
              <div>
                <Label className="text-xs">Value</Label>
                <Input
                  type="number"
                  value={node.data.conditionValue ?? ""}
                  onChange={(e) => handleConditionChange({ conditionValue: e.target.value })}
                  placeholder="e.g. 200"
                  className="mt-1 h-8 text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Connections */}
        <div className="pt-4 mt-2 border-t border-border space-y-3">
          <Label className="text-xs font-semibold">Connections (Outgoing)</Label>
          {outgoingEdges.length > 0 && (
            <div className="space-y-2">
              {outgoingEdges.map((edge) => {
                const targetNode = nodes.find((n) => n.id === edge.target);
                return (
                  <div
                    key={edge.id}
                    className="flex items-center justify-between bg-muted/50 border border-border p-2 rounded-md text-xs"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground">
                        {edge.sourceHandle === "true" ? "True Path"
                          : edge.sourceHandle === "false" ? "False Path"
                          : "Next"}
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {targetNode?.data.label || "Unknown Node"}
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
            </div>
          )}

          {baseType !== "end" && (
            <div className="flex gap-1.5 items-end mt-2">
              {baseType === "condition" && (
                <Select value={newHandle} onValueChange={setNewHandle}>
                  <SelectTrigger className="h-8 text-xs w-[75px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={newTarget} onValueChange={setNewTarget}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Connect to..." />
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
                  addManualEdge(node.id, newTarget, baseType === "condition" ? newHandle : "out");
                  setNewTarget("");
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

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