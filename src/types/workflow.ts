export type NodeType = "start" | "api" | "condition" | "startNode" | "apiNode" | "conditionNode" |"endNode";

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  label: string;
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  condition?: string;
  conditionVariable?: string;
  conditionOperator?: "exists" | "not_exists" | "==" | "!=" | ">" | "<" | ">=" | "<=";
  conditionValue?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle?: "out" | "true" | "false" | null;
  target: string;
  label?: string;
}

export interface WorkflowDocument {
  _id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowShort {
  _id: string;
  name: string;
  updated_at: string;
}

export interface WorkflowCreate {
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowUpdate extends WorkflowCreate {}
