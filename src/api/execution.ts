import { apiClient } from "./axios";

export interface ExecutionLog {
  timestamp: string;
  node_id: string;
  label: string;
  payload: any;
  status: "ok" | "error";
}

export interface ExecutionState {
  workflow_id: string;
  status: "idle" | "running" | "completed" | "error" | "stopped";
  logs: ExecutionLog[];
}

export const executionApi = {
  run: (workflowId: string, payload?: any) =>
    apiClient
      .post<{ status: string; workflow_id: string }>(`/api/execute/${workflowId}/run`, { payload: payload ?? {} })
      .then(r => r.data),

  stop: (workflowId: string) =>
    apiClient
      .post<{ status: string }>(`/api/execute/${workflowId}/stop`, {})
      .then(r => r.data),

  status: (workflowId: string) =>
    apiClient
      .get<ExecutionState>(`/api/execute/${workflowId}/status`)
      .then(r => r.data),

  // Returns the SSE URL — used directly with EventSource
  streamUrl: (workflowId: string) =>
    `http://localhost:8000/api/execute/${workflowId}/stream`,
};