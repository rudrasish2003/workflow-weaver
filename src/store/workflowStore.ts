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
  removeEdge: (id: string) => void;
  addManualEdge: (source: string, target: string, sourceHandle?: string) => void;
  loadWorkflow: (id: string, name: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  newWorkflow: () => void;
  setActiveWorkflowName: (name: string) => void;
  markDirty: () => void;
}

// --- UPGRADED GARBAGE COLLECTOR ---
// Automatically destroys floating edges AND removes duplicate IDs
const cleanEdges = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const seenEdgeIds = new Set<string>();

  return edges.filter((e) => {
    // 1. Drop the edge if its source or target node doesn't exist
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      return false;
    }
    // 2. Drop the edge if we've already seen this exact ID
    if (seenEdgeIds.has(e.id)) {
      return false;
    }
    
    seenEdgeIds.add(e.id);
    return true;
  });
};

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  activeWorkflowId: null,
  activeWorkflowName: "Untitled Workflow",
  isDirty: false,

  // Run cleanup when forcing new states (e.g., from AI generation)
  setNodes: (nodes) => set((s) => ({ nodes, edges: cleanEdges(nodes, s.edges), isDirty: true })),
  setEdges: (edges) => set((s) => ({ edges: cleanEdges(s.nodes, edges), isDirty: true })),

  onNodesChange: (changes) =>
    set((s) => {
      const newNodes = applyNodeChanges(changes, s.nodes as any) as unknown as WorkflowNode[];
      
      // Check if any of the changes are a "remove" action (e.g., hitting Backspace)
      const hasRemovals = changes.some((c) => c.type === "remove");
      
      return {
        nodes: newNodes,
        // ONLY clean the edges if a node was deleted. Otherwise, keep the exact same edges so they don't disconnect while dragging.
        edges: hasRemovals ? cleanEdges(newNodes, s.edges) : s.edges,
        // Only mark dirty if it's a real change, not just selecting a node
        isDirty: s.isDirty || changes.some((c) => c.type !== "select"),
      };
    }),

  onEdgesChange: (changes) =>
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges as any) as unknown as WorkflowEdge[],
      isDirty: true,
    })),

  onConnect: (connection) =>
    set((s) => {
      // 100% Collision-proof ID generation
      const safeId = `edge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newEdge = {
        ...connection,
        id: safeId,
        type: "custom",
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

  removeEdge: (id) =>
    set((s) => ({
      edges: s.edges.filter((e) => e.id !== id),
      isDirty: true,
    })),

  addManualEdge: (source, target, sourceHandle = "out") =>
    set((s) => {
      // Prevent duplicate identical edges from being created
      if (
        s.edges.some(
          (e) => e.source === source && e.target === target && e.sourceHandle === sourceHandle
        )
      ) {
        return s;
      }
      
      const safeId = `edge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newEdge = {
        id: safeId,
        source,
        target,
        sourceHandle,
        type: "custom",
      };
      
      return {
        edges: [...s.edges, newEdge as unknown as WorkflowEdge],
        isDirty: true,
      };
    }),

  loadWorkflow: (id, name, nodes, edges) =>
    set({ 
      activeWorkflowId: id, 
      activeWorkflowName: name, 
      nodes, 
      // Clean up any bad edge data saved in the database (removes floating edges and duplicates)
      edges: cleanEdges(nodes, edges), 
      isDirty: false, 
      selectedNodeId: null 
    }),

  newWorkflow: () =>
    set({ activeWorkflowId: null, activeWorkflowName: "Untitled Workflow", nodes: [], edges: [], isDirty: false, selectedNodeId: null }),

  setActiveWorkflowName: (name) => set({ activeWorkflowName: name }),
  markDirty: () => set({ isDirty: true }),
}));