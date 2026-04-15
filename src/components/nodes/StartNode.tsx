import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";

export function StartNode({ id, data }: NodeProps) {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  return (
    <div
      onClick={() => selectNode(id)}
      className="w-48 rounded-xl border-2 border-node-start-border bg-node-start-bg cursor-pointer hover:shadow-md transition-all"
    >
      <div className="p-3">
        <span className="inline-block rounded bg-node-start-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground mb-1.5">
          Start
        </span>
        <p className="text-sm font-semibold text-foreground truncate">
          {(data as any).label}
        </p>
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
