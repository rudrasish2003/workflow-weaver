import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";
import { Brain } from "lucide-react";

const MODE_LABELS: Record<string, string> = {
  text:     "Text",
  json:     "JSON",
  decision: "Decision",
};

export function LLMNode({ id, data }: NodeProps) {
  const selectNode      = useWorkflowStore((s) => s.selectNode);
  const executingNodeId = useWorkflowStore((s) => s.executingNodeId);
  const errorNodeId     = useWorkflowStore((s) => s.errorNodeId);

  const isExecuting = executingNodeId === id;
  const isError     = errorNodeId === id;
  const d = data as any;
  const mode = d.outputMode || "text";
  const isDecision = mode === "decision";

  return (
    <div
      onClick={() => selectNode(id)}
      className={[
        "w-52 rounded-xl border-2 cursor-pointer transition-all relative",
        isExecuting
          ? "border-violet-400 bg-violet-50 node-executing"
          : isError
          ? "border-red-500 bg-red-50 node-error-flash"
          : "border-violet-300 bg-violet-50 hover:shadow-md",
      ].join(" ")}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded bg-violet-200 flex items-center justify-center shrink-0">
            <Brain className="w-3 h-3 text-violet-700" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
            LLM · {d.llmModel || "gpt-4o"}
          </span>
        </div>

        {/* Label */}
        <p className="text-sm font-semibold text-foreground truncate">{d.label || "AI Node"}</p>

        {/* Mode badge */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={[
            "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
            mode === "decision" ? "bg-amber-100 text-amber-700"
              : mode === "json" ? "bg-blue-100 text-blue-700"
              : "bg-violet-100 text-violet-700",
          ].join(" ")}>
            {MODE_LABELS[mode] || mode}
          </span>
          {d.systemPrompt && (
            <p className="text-[10px] text-violet-500 truncate flex-1">
              {d.systemPrompt.slice(0, 30)}{d.systemPrompt.length > 30 ? "…" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} />

      {isDecision ? (
        <>
          {/* Decision node: two output handles like condition node */}
          <Handle type="source" position={Position.Bottom} id="true" />
          <Handle type="source" position={Position.Right}  id="false" />
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-emerald-600">
            yes
          </span>
          <span className="absolute top-1/2 -right-6 -translate-y-1/2 text-[9px] font-medium text-red-500">
            no
          </span>
        </>
      ) : (
        <Handle type="source" position={Position.Right} id="out" />
      )}
    </div>
  );
}