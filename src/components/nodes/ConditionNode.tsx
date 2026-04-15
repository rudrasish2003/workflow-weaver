import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";

export function ConditionNode({ id, data }: NodeProps) {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const d = data as any;
  return (
    <div
      onClick={() => selectNode(id)}
      className="w-48 rounded-xl border-2 border-amber-500 bg-amber-50 cursor-pointer hover:border-amber-600 hover:shadow-md transition-all"
    >
      <div className="p-3">
        <span className="inline-block rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1.5">
          Condition
        </span>
        <p className="text-sm font-semibold text-foreground truncate">{d.label}</p>
        {d.condition && (
          <p className="text-[10px] text-amber-600 truncate mt-1">{d.condition}</p>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Bottom} id="true" />
      <Handle type="source" position={Position.Right} id="false" />
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-emerald-600">
        true
      </span>
      <span className="absolute top-1/2 -right-6 -translate-y-1/2 text-[9px] font-medium text-red-500">
        false
      </span>
    </div>
  );
}
