import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";

export function ConditionNode({ id, data }: NodeProps) {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const d = data as any;
  return (
    <div
      onClick={() => selectNode(id)}
      className="w-48 rounded-xl border-2 border-node-condition-border bg-node-condition-bg cursor-pointer hover:shadow-md transition-all relative"
    >
      <div className="p-3">
        <span className="inline-block rounded bg-node-condition-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground mb-1.5">
          Condition
        </span>
        <p className="text-sm font-semibold text-foreground truncate">{d.label}</p>
        {d.condition && (
          <p className="text-[10px] text-node-condition truncate mt-1">{d.condition}</p>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Bottom} id="true" />
      <Handle type="source" position={Position.Right} id="false" />
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-edge-true">
        true
      </span>
      <span className="absolute top-1/2 -right-6 -translate-y-1/2 text-[9px] font-medium text-edge-false">
        false
      </span>
    </div>
  );
}
