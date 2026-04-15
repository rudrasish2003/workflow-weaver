import { useWorkflowList, useDeleteWorkflow } from "../../hooks/useWorkflows";
import { useWorkflowStore } from "../../store/workflowStore";
import { workflowsApi } from "../../api/workflows";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Workflow } from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function Sidebar() {
  const { data: workflows, isLoading } = useWorkflowList();
  const deleteMutation = useDeleteWorkflow();
  const { activeWorkflowId, loadWorkflow, newWorkflow } = useWorkflowStore();

  const handleSelect = async (id: string) => {
    const wf = await workflowsApi.get(id);
    loadWorkflow(wf._id, wf.name, wf.nodes, wf.edges);
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <Button onClick={newWorkflow} className="w-full gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}

        {workflows?.map((wf) => (
          <div
            key={wf.id}
            onClick={() => handleSelect(wf.id)}
            className={`group relative flex items-start gap-2 rounded-lg p-2.5 cursor-pointer transition-colors ${
              activeWorkflowId === wf.id
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Workflow className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{wf.name}</p>
              <p className="text-[11px] text-muted-foreground">{timeAgo(wf.updated_at)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(wf.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {!isLoading && workflows?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No workflows yet</p>
        )}
      </div>
    </div>
  );
}
