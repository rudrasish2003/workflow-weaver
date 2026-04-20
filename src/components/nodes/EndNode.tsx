import { Handle, Position } from "@xyflow/react";
import { Square } from "lucide-react";

export function EndNode({ data }: { data: any }) {
  return (
    <div className="bg-card border-2 border-destructive/80 rounded-xl shadow-sm min-w-[150px] overflow-hidden">
      {/* Target Handle (Input only) */}
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
          {data.label || "End"}
        </div>
      </div>
    </div>
  );
}