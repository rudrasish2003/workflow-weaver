import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";
import { Zap } from "lucide-react";

const methodColors: Record<string, string> = {
  GET: "bg-node-start-bg text-node-start border-node-start-border",
  POST: "bg-node-api-bg text-node-api border-node-api-border",
  PUT: "bg-node-condition-bg text-node-condition border-node-condition-border",
  DELETE: "bg-destructive/10 text-destructive border-destructive/30",
};

export function ApiNode({ id, data, selected }: NodeProps) {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const d = data as any;
  const method = d.method ?? "GET";

  return (
    <div
      onClick={() => selectNode(id)}
      className={`group w-56 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        selected ? "ring-2 ring-node-api shadow-lg" : ""
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-node-api w-full" />

      <div className="p-3.5 flex items-center gap-3">
        {/* Icon container */}
        <div className="w-9 h-9 rounded-xl bg-node-api-bg border border-node-api-border flex items-center justify-center shrink-0">
          <Zap className="h-4 w-4 text-node-api fill-node-api/20" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-node-api mb-0.5">
            API Call
          </p>
          <p className="text-sm font-medium text-foreground truncate">{d.label}</p>
          {(d.method || d.url) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${methodColors[method] || methodColors.GET}`}>
                {method}
              </span>
              {d.url && (
                <span className="text-[10px] text-muted-foreground truncate">{d.url}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !border-2 !border-node-api !bg-card hover:!bg-node-api !-left-[7px] transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!w-3.5 !h-3.5 !border-2 !border-node-api !bg-card hover:!bg-node-api !-right-[7px] transition-colors"
      />
    </div>
  );
}
