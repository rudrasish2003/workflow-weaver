import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";

export function ApiNode({ id, data }: NodeProps) {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const d = data as any;
  return (
    <div
      onClick={() => selectNode(id)}
      className="w-48 rounded-xl border-2 border-blue-500 bg-blue-50 cursor-pointer hover:border-blue-600 hover:shadow-md transition-all"
    >
      <div className="p-3">
        <span className="inline-block rounded bg-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1.5">
          API
        </span>
        <p className="text-sm font-semibold text-foreground truncate">{d.label}</p>
        {(d.method || d.url) && (
          <p className="text-[10px] text-blue-600 truncate mt-1">
            {d.method ?? "GET"} {d.url ?? ""}
          </p>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
