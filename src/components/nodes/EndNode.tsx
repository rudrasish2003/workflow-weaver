import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Square } from "lucide-react";
import { useWorkflowStore } from "../../store/workflowStore";

export function EndNode({ id, data }: NodeProps) {
  const executingNodeId = useWorkflowStore((s) => s.executingNodeId);
  const errorNodeId     = useWorkflowStore((s) => s.errorNodeId);

  const isExecuting = executingNodeId === id;
  const isError     = errorNodeId === id;

  return (
    <div
      className={[
        "rounded-xl border-2 shadow-sm min-w-[150px] overflow-visible transition-all",
        isExecuting
          ? "border-blue-400 bg-card node-executing"
          : isError
          ? "border-red-500 bg-red-50 node-error-flash"
          : "border-destructive/80 bg-card",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-destructive border-2 border-background"
      />
      <div className="p-3 flex items-center gap-2">
        <div className="bg-destructive/20 p-2 rounded-md">
          <Square className="w-4 h-4 text-destructive fill-destructive" />
        </div>
        <div className="font-semibold text-sm text-foreground">
          {(data as any).label || "End"}
        </div>
      </div>
    </div>
  );
}