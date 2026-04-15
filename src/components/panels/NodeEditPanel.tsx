import { useWorkflowStore } from "../../store/workflowStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, X } from "lucide-react";

export function NodeEditPanel() {
  const { selectedNodeId, nodes, updateNodeData, removeNode, selectNode } = useWorkflowStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const baseType = node.type?.replace("Node", "") as string;

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

        {(baseType === "api") && (
          <>
            <div>
              <Label className="text-xs">Method</Label>
              <Select
                value={node.data.method ?? "GET"}
                onValueChange={(v) => updateNodeData(node.id, { method: v as any })}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
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

        {(baseType === "condition") && (
          <div>
            <Label className="text-xs">Condition</Label>
            <Input
              value={node.data.condition ?? ""}
              onChange={(e) => updateNodeData(node.id, { condition: e.target.value })}
              placeholder="status == 200"
              className="mt-1 h-8 text-sm"
            />
          </div>
        )}
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
