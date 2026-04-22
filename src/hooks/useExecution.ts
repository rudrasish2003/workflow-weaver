import { useState, useRef, useCallback } from "react";
import { executionApi, ExecutionLog, ExecutionState } from "../api/execution";
import { useWorkflowStore } from "../store/workflowStore";
import { toast } from "sonner";

export function useExecution(workflowId: string | null) {
  const [state, setState] = useState<ExecutionState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const executingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (executingTimerRef.current) {
      clearTimeout(executingTimerRef.current);
      executingTimerRef.current = null;
    }
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    clearTimers();
    useWorkflowStore.getState().setExecutingNodeId(null);
    useWorkflowStore.getState().setErrorNodeId(null);
  }, [clearTimers]);

  const run = useCallback(async (payload?: any) => {
    if (!workflowId) return;

    // Reset state
    setState({ workflow_id: workflowId, status: "running", logs: [] });
    setIsRunning(true);
    stopStream();

    // Also clear any leftover error highlight from a previous run
    useWorkflowStore.getState().setErrorNodeId(null);

    try {
      await executionApi.run(workflowId, payload);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to start workflow");
      setIsRunning(false);
      return;
    }

    const es = new EventSource(executionApi.streamUrl(workflowId));
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // ── Final done event ────────────────────────────────────────────
        if (data.event === "done") {
          useWorkflowStore.getState().setExecutingNodeId(null);
          setState(prev => prev ? { ...prev, status: data.status } : prev);
          setIsRunning(false);
          stopStream();

          if (data.status === "completed") toast.success("Workflow completed!");
          if (data.status === "error")     toast.error("Workflow execution failed");
          if (data.status === "stopped")   toast.info("Workflow stopped");
          return;
        }

        // ── Log entry (a node just finished) ────────────────────────────
        const log = data as ExecutionLog;

        if (log.status === "error") {
          // Node failed — highlight it red, clear blue, stop execution
          clearTimers();
          useWorkflowStore.getState().setExecutingNodeId(null);
          useWorkflowStore.getState().setErrorNodeId(log.node_id);

          // Keep the red flash for 2.5 s then fade
          errorTimerRef.current = setTimeout(() => {
            useWorkflowStore.getState().setErrorNodeId(null);
          }, 2500);

          // Append log and mark as error — the "done" event from backend
          // will also arrive, but if it doesn't (network cut), we stop here.
          setState(prev => {
            if (!prev) return prev;
            return { ...prev, logs: [...prev.logs, log], status: "error" };
          });

          // Stop the SSE stream and mark as not running
          setIsRunning(false);
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          toast.error(`Node "${log.label}" failed`);
          return;
        }

        // ── Happy path — node completed OK ──────────────────────────────
        if (log.node_id) {
          // Light up the node blue while processing
          useWorkflowStore.getState().setExecutingNodeId(log.node_id);

          // Clear the blue highlight after 700 ms
          clearTimers();
          executingTimerRef.current = setTimeout(() => {
            useWorkflowStore.getState().setExecutingNodeId(null);
          }, 700);
        }

        setState(prev => {
          if (!prev) return prev;
          return { ...prev, logs: [...prev.logs, log] };
        });

      } catch {
        // Malformed SSE data — ignore silently
      }
    };

    es.onerror = () => {
      useWorkflowStore.getState().setExecutingNodeId(null);
      setIsRunning(false);
      stopStream();
    };
  }, [workflowId, stopStream, clearTimers]);

  const stop = useCallback(async () => {
    if (!workflowId) return;
    stopStream();
    try {
      await executionApi.stop(workflowId);
      setState(prev => prev ? { ...prev, status: "stopped" } : prev);
      setIsRunning(false);
      toast.info("Workflow stopped");
    } catch {
      toast.error("Failed to stop workflow");
    }
  }, [workflowId, stopStream]);

  return { state, isRunning, run, stop };
}