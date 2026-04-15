import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";
import { GitBranch } from "lucide-react";

export function ConditionNode({ id, data, selected }: NodeProps) {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const d = data as any;
  return (
    <div
      onClick={() => selectNode(id)}
      className={`group w-56 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden relative ${
        selected ? "ring-2 ring-node-condition shadow-lg" : ""
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-node-condition w-full" />

      <div className="p-3.5 flex items-center gap-3">
        {/* Icon container */}
        <div className="w-9 h-9 rounded-xl bg-node-condition-bg border border-node-condition-border flex items-center justify-center shrink-0">
          <GitBranch className="h-4 w-4 text-node-condition" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-node-condition mb-0.5">
            Condition
          </p>
          <p className="text-sm font-medium text-foreground truncate">{d.label}</p>
          {d.condition && (
            <p className="text-[10px] text-muted-foreground truncate mt-1 font-mono bg-muted rounded px-1.5 py-0.5">
              {d.condition}
            </p>
          )}
        </div>
      </div>

      {/* Output labels */}
      <div className="flex items-center justify-between px-3.5 pb-2 pt-0">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-edge-true" />
          <span className="text-[9px] font-medium text-edge-true">True</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-medium text-edge-false">False</span>
          <span className="w-1.5 h-1.5 rounded-full bg-edge-false" />
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !border-2 !border-node-condition !bg-card hover:!bg-node-condition !-left-[7px] transition-colors"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-3.5 !h-3.5 !border-2 !border-edge-true !bg-card hover:!bg-edge-true !-bottom-[7px] transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!w-3.5 !h-3.5 !border-2 !border-edge-false !bg-card hover:!bg-edge-false !-right-[7px] transition-colors"
      />
    </div>
  );
}
