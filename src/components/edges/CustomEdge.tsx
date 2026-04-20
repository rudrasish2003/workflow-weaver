import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import { X } from 'lucide-react';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  sourceHandleId,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const removeEdge = useWorkflowStore((s) => s.removeEdge);

  // Dynamic colors based on the output handle
  let strokeColor = "#94a3b8"; // Default slate
  if (sourceHandleId === "true") strokeColor = "#22c55e"; // Green for true
  if (sourceHandleId === "false") strokeColor = "#ef4444"; // Red for false

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: strokeColor, strokeWidth: 2 }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeEdge(id);
            }}
            className="h-5 w-5 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors shadow-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}