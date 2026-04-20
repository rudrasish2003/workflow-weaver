import { useState, useRef, useCallback } from "react";
import { executionApi, ExecutionLog, ExecutionState } from "../api/execution";
import { toast } from "sonner";

export function useExecution(workflowId: string | null) {
  const [state, setState] = useState<ExecutionState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const run = useCallback(async (payload?: any) => {
    if (!workflowId) return;

    // Reset state
    setState({ workflow_id: workflowId, status: "running", logs: [] });
    setIsRunning(true);
    stopStream();

    try {
      await executionApi.run(workflowId, payload);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to start workflow");
      setIsRunning(false);
      return;
    }

    // Open SSE stream
    const es = new EventSource(executionApi.streamUrl(workflowId));
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Final status event
        if (data.event === "done") {
          setState(prev => prev ? { ...prev, status: data.status } : prev);
          setIsRunning(false);
          stopStream();
          if (data.status === "completed") toast.success("Workflow completed!");
          if (data.status === "error") toast.error("Workflow execution failed");
          return;
        }

        // Log entry event
        setState(prev => {
          if (!prev) return prev;
          return { ...prev, logs: [...prev.logs, data as ExecutionLog] };
        });
      } catch {}
    };

    es.onerror = () => {
      setIsRunning(false);
      stopStream();
    };
  }, [workflowId, stopStream]);

  const stop = useCallback(async () => {
    if (!workflowId) return;
    stopStream();
    try {
      await executionApi.stop(workflowId);
      setState(prev => prev ? { ...prev, status: "stopped" } : prev);
      setIsRunning(false);
      toast.info("Workflow stopped");
    } catch (e: any) {
      toast.error("Failed to stop workflow");
    }
  }, [workflowId, stopStream]);

  return { state, isRunning, run, stop };
}