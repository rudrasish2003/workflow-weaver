import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";

export function ApiNode({ id, data }: NodeProps) {
  const selectNode      = useWorkflowStore((s) => s.selectNode);
  const executingNodeId = useWorkflowStore((s) => s.executingNodeId);
  const errorNodeId     = useWorkflowStore((s) => s.errorNodeId);

  const isExecuting = executingNodeId === id;
  const isError     = errorNodeId === id;

  const d = data as any;

  return (
    <div
      onClick={() => selectNode(id)}
      className={[
        "w-48 rounded-xl border-2 cursor-pointer transition-all",
        isExecuting
          ? "border-blue-400 bg-node-api-bg node-executing"
          : isError
          ? "border-red-500 bg-red-50 node-error-flash"
          : "border-node-api-border bg-node-api-bg hover:shadow-md",
      ].join(" ")}
    >
      <div className="p-3">
        <span className="inline-block rounded bg-node-api-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground mb-1.5">
          API
        </span>
        <p className="text-sm font-semibold text-foreground truncate">{d.label}</p>
        {(d.method || d.url) && (
          <p className="text-[10px] text-node-api truncate mt-1">
            {d.method ?? "GET"} {d.url ?? ""}
          </p>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}