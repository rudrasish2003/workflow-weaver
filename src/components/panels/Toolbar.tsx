import { useState } from "react";
import { useWorkflowStore } from "../../store/workflowStore";
import { useUpdateWorkflow } from "../../hooks/useWorkflows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaveWorkflowModal } from "../modals/SaveWorkflowModal";
import { AIGenerateModal } from "../modals/AIGenerateModal";
import { Play, Zap, GitBranch, Sparkles, Save, Loader2 } from "lucide-react";

export function Toolbar() {
  const { addNode, activeWorkflowId, activeWorkflowName, setActiveWorkflowName, isDirty, nodes, edges } = useWorkflowStore();
  const updateMutation = useUpdateWorkflow();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const handleAddNode = (type: "start" | "api" | "condition") => {
    const id = crypto.randomUUID();
    const defaults: Record<string, any> = {
      start: { label: "Start", type: "start" },
      api: { label: "API Call", type: "api", method: "GET", url: "" },
      condition: { label: "Condition", type: "condition", condition: "" },
    };
    addNode({
      id,
      type,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: defaults[type],
    });
  };

  const handleSave = () => {
    if (activeWorkflowId) {
      updateMutation.mutate({
        id: activeWorkflowId,
        data: { name: activeWorkflowName, nodes, edges },
      });
    } else {
      setShowSaveModal(true);
    }
  };

  return (
    <>
      <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => handleAddNode("start")} className="gap-1.5 text-xs">
            <Play className="h-3.5 w-3.5 text-emerald-500" /> Start
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAddNode("api")} className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-blue-500" /> API
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAddNode("condition")} className="gap-1.5 text-xs">
            <GitBranch className="h-3.5 w-3.5 text-amber-500" /> Condition
          </Button>
        </div>

        <div className="flex-1 flex justify-center">
          <Input
            value={activeWorkflowName}
            onChange={(e) => setActiveWorkflowName(e.target.value)}
            className="w-56 text-center text-sm font-medium h-8 border-transparent hover:border-border focus:border-ring"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setShowAIModal(true)} className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> AI Generate
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="gap-1.5 text-xs">
            {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
          </Button>
        </div>
      </div>

      <SaveWorkflowModal open={showSaveModal} onOpenChange={setShowSaveModal} />
      <AIGenerateModal open={showAIModal} onOpenChange={setShowAIModal} />
    </>
  );
}
