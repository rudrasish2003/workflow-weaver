import { create } from "zustand";
import { WorkflowNode, WorkflowEdge } from "../types/workflow";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import type { NodeChange, EdgeChange, Connection } from "@xyflow/react";

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  activeWorkflowId: string | null;
  activeWorkflowName: string;
  isDirty: boolean;

  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNode["data"]>) => void;
  addNode: (node: WorkflowNode) => void;
  removeNode: (id: string) => void;
  loadWorkflow: (id: string, name: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  newWorkflow: () => void;
  setActiveWorkflowName: (name: string) => void;
  markDirty: () => void;
}

let edgeCounter = 1;

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  activeWorkflowId: null,
  activeWorkflowName: "Untitled Workflow",
  isDirty: false,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) =>
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes as any) as unknown as WorkflowNode[],
      isDirty: true,
    })),

  onEdgesChange: (changes) =>
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges as any) as unknown as WorkflowEdge[],
      isDirty: true,
    })),

  onConnect: (connection) =>
    set((s) => {
      const newEdge = {
        ...connection,
        id: `e${edgeCounter++}`,
        sourceHandle: (connection.sourceHandle as any) ?? "out",
      };
      return {
        edges: addEdge(newEdge, s.edges as any) as unknown as WorkflowEdge[],
        isDirty: true,
      };
    }),

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    })),

  addNode: (node) =>
    set((s) => ({ nodes: [...s.nodes, node], isDirty: true })),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      isDirty: true,
    })),

  loadWorkflow: (id, name, nodes, edges) =>
    set({ activeWorkflowId: id, activeWorkflowName: name, nodes, edges, isDirty: false, selectedNodeId: null }),

  newWorkflow: () =>
    set({ activeWorkflowId: null, activeWorkflowName: "Untitled Workflow", nodes: [], edges: [], isDirty: false, selectedNodeId: null }),

  setActiveWorkflowName: (name) => set({ activeWorkflowName: name }),
  markDirty: () => set({ isDirty: true }),
}));
