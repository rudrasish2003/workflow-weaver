import { apiClient } from "./axios";
import { WorkflowNode, WorkflowEdge } from "../types/workflow";

export const aiApi = {
  generate: (prompt: string) =>
    apiClient
      .post<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>("/api/ai/generate", { prompt })
      .then(r => r.data),
};
