import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "../store/workflowStore";
import { StartNode } from "../components/nodes/StartNode";
import { ApiNode } from "../components/nodes/ApiNode";
import { ConditionNode } from "../components/nodes/ConditionNode";
import { EndNode } from "../components/nodes/EndNode";
import { CustomEdge } from "../components/edges/CustomEdge";
import { Sidebar } from "../components/panels/Sidebar";
import { Toolbar } from "../components/panels/Toolbar";
import { NodeEditPanel } from "../components/panels/NodeEditPanel";
import { ExecutionPanel } from "../components/panels/ExecutionPanel"; // ADD

const nodeTypes = {
  start: StartNode,
  api: ApiNode,
  condition: ConditionNode,
  startNode: StartNode,
  apiNode: ApiNode,
  conditionNode: ConditionNode,
  endNode: EndNode,
};

const edgeTypes = { custom: CustomEdge };

export default function WorkflowEditor() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    selectNode, 
    selectedNodeId,
    activeWorkflowId, // ADD
  } = useWorkflowStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        
        <div className="flex-1 relative flex">
          <div className="flex-1 h-full w-full">
            <ReactFlow
              nodes={nodes as any}
              edges={edges as any}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => selectNode(node.id)}
              onPaneClick={() => selectNode(null)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{ type: "custom" }}
              fitView
              isValidConnection={(connection) => connection.source !== connection.target}
              elevateNodesOnSelect={true}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--border)" />
              <Controls className="bg-card border-border fill-foreground" />
              <MiniMap 
                className="bg-card border-border" 
                maskColor="var(--muted)" 
                nodeColor="var(--primary)" 
              />
            </ReactFlow>
          </div>
          
          {/* Slide-in Edit Panel */}
          {selectedNodeId && <NodeEditPanel />}

          {/* Execution Panel — visible when no node is selected and a workflow is loaded */}
          {!selectedNodeId && <ExecutionPanel workflowId={activeWorkflowId} />} {/* ADD */}
        </div>
      </div>
    </div>
  );
}