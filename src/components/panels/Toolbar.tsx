// src/components/panels/Toolbar.tsx
import { useState } from "react";
import { useWorkflowStore } from "../../store/workflowStore";
import { useUpdateWorkflow } from "../../hooks/useWorkflows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveWorkflowModal } from "../modals/SaveWorkflowModal";
import { AIGenerateModal } from "../modals/AIGenerateModal";
import { Play, Zap, GitBranch, Sparkles, Save, Loader2, Square, Brain, Plus } from "lucide-react";

export function Toolbar() {
  const { addNode, activeWorkflowId, activeWorkflowName, setActiveWorkflowName, isDirty, nodes, edges } =
    useWorkflowStore();
  const updateMutation = useUpdateWorkflow();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAIModal, setShowAIModal]     = useState(false);

  const handleAddNode = (type: "start" | "api" | "condition" | "endNode" | "llmNode") => {
    const id = crypto.randomUUID();
    const defaults: Record<string, any> = {
      start:   { label: "Start",       type: "start" },
      api:     { label: "API Call",    type: "api",     method: "GET", url: "" },
      condition: { label: "Condition", type: "condition", condition: "" },
      endNode: { label: "End",         type: "endNode" },
      llmNode: {
        label:        "AI Reasoning",
        type:         "llmNode",
        llmModel:     "gpt-4o",
        outputMode:   "text",
        systemPrompt: "You are a helpful assistant. Analyze the data you receive.",
        userPrompt:   "",
        outputSchema: "",
        temperature:  0.3,
        maxTokens:    500,
      },
    };
    addNode({
      id,
      type,
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: defaults[type],
    });
  };

  const handleSave = () => {
    if (activeWorkflowId) {
      updateMutation.mutate({ id: activeWorkflowId, data: { name: activeWorkflowName, nodes, edges } });
    } else {
      setShowSaveModal(true);
    }
  };

  return (
    <>
      <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => handleAddNode("start")} className="gap-2 text-xs cursor-pointer">
                <Play className="h-3.5 w-3.5 text-emerald-500" /> Start
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode("api")} className="gap-2 text-xs cursor-pointer">
                <Zap className="h-3.5 w-3.5 text-blue-500" /> API
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode("condition")} className="gap-2 text-xs cursor-pointer">
                <GitBranch className="h-3.5 w-3.5 text-amber-500" /> Condition
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode("llmNode")} className="gap-2 text-xs cursor-pointer">
                <Brain className="h-3.5 w-3.5 text-violet-500" /> LLM
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNode("endNode")} className="gap-2 text-xs cursor-pointer">
                <Square className="h-3.5 w-3.5 text-destructive" /> End
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {updateMutation.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Save className="h-3.5 w-3.5" />}
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