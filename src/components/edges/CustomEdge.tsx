import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";

export function CustomEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, sourceHandleId, label,
  markerEnd, style,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const color =
    sourceHandleId === "true" ? "hsl(var(--edge-true))" :
    sourceHandleId === "false" ? "hsl(var(--edge-false))" :
    "hsl(var(--primary))";

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: color, strokeWidth: 2 }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
            className="absolute rounded-md bg-card px-2 py-0.5 text-[10px] font-medium border border-border shadow-sm pointer-events-none text-foreground"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
