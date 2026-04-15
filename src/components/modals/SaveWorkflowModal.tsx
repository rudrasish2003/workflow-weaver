import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateWorkflow } from "../../hooks/useWorkflows";
import { useWorkflowStore } from "../../store/workflowStore";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveWorkflowModal({ open, onOpenChange }: Props) {
  const { nodes, edges, activeWorkflowName } = useWorkflowStore();
  const createMutation = useCreateWorkflow();
  const [name, setName] = useState(activeWorkflowName);
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    createMutation.mutate(
      { name: name.trim(), description: description.trim() || undefined, nodes, edges },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="My Workflow" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" placeholder="Optional description..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
