import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";
import { Play } from "lucide-react";

export function StartNode({ id, data, selected }: NodeProps) {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  return (
    <div
      onClick={() => selectNode(id)}
      className={`group w-56 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        selected ? "ring-2 ring-node-start shadow-lg" : ""
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-node-start w-full" />

      <div className="p-3.5 flex items-center gap-3">
        {/* Icon container */}
        <div className="w-9 h-9 rounded-xl bg-node-start-bg border border-node-start-border flex items-center justify-center shrink-0">
          <Play className="h-4 w-4 text-node-start fill-node-start" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-node-start mb-0.5">
            Start
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {(data as any).label}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!w-3.5 !h-3.5 !border-2 !border-node-start !bg-card hover:!bg-node-start !-right-[7px] transition-colors"
      />
    </div>
  );
}
