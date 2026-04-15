import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGenerateWorkflow } from "../../hooks/useWorkflows";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIGenerateModal({ open, onOpenChange }: Props) {
  const [prompt, setPrompt] = useState("");
  const generateMutation = useGenerateWorkflow();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate(prompt.trim(), {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> AI Generate Workflow
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Fetch user data from https://api.example.com/users, if status is 200 send to Slack webhook, otherwise log the error"
            className="min-h-[120px]"
          />
          {generateMutation.isError && (
            <p className="text-xs text-destructive">
              {(generateMutation.error as any)?.message ?? "Generation failed. Please try again."}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={!prompt.trim() || generateMutation.isPending}>
            {generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
