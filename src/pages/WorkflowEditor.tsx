import { useState, useCallback, useRef } from "react";
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, useReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "../store/workflowStore";
import { StartNode } from "../components/nodes/StartNode";
import { ApiNode } from "../components/nodes/ApiNode";
import { ConditionNode } from "../components/nodes/ConditionNode";
import { CustomEdge } from "../components/edges/CustomEdge";
import { Sidebar } from "../components/panels/Sidebar";
import { Toolbar } from "../components/panels/Toolbar";
import { NodeEditPanel } from "../components/panels/NodeEditPanel";
import { EdgeDropMenu } from "../components/menus/EdgeDropMenu";

const nodeTypes = {
  start: StartNode,
  api: ApiNode,
  condition: ConditionNode,
  startNode: StartNode,
  apiNode: ApiNode,
  conditionNode: ConditionNode,
};

const edgeTypes = { custom: CustomEdge };

function WorkflowEditorInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode, selectedNodeId, addNode } = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();
  const connectingNodeRef = useRef<{ nodeId: string; handleId: string | null } | null>(null);

  const [dropMenu, setDropMenu] = useState<{
    position: { x: number; y: number };
    flowPosition: { x: number; y: number };
  } | null>(null);

  const onConnectStart = useCallback((_: any, params: any) => {
    connectingNodeRef.current = { nodeId: params.nodeId, handleId: params.handleId };
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeRef.current) return;

      const target = event.target as HTMLElement;
      // If dropped on a handle or node, ReactFlow handles the connection
      if (target.closest(".react-flow__handle") || target.closest(".react-flow__node")) {
        connectingNodeRef.current = null;
        return;
      }

      const clientX = "changedTouches" in event ? event.changedTouches[0].clientX : (event as MouseEvent).clientX;
      const clientY = "changedTouches" in event ? event.changedTouches[0].clientY : (event as MouseEvent).clientY;

      const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });

      setDropMenu({
        position: { x: clientX, y: clientY },
        flowPosition,
      });
    },
    [screenToFlowPosition]
  );

  const handleDropMenuSelect = useCallback(
    (type: "start" | "api" | "condition") => {
      if (!dropMenu || !connectingNodeRef.current) return;

      const id = crypto.randomUUID();
      const defaults: Record<string, any> = {
        start: { label: "Start", type: "start" },
        api: { label: "API Call", type: "api", method: "GET", url: "" },
        condition: { label: "Condition", type: "condition", condition: "" },
      };

      addNode({
        id,
        type,
        position: dropMenu.flowPosition,
        data: defaults[type],
      });

      // Connect the new node
      const { nodeId, handleId } = connectingNodeRef.current;
      onConnect({
        source: nodeId,
        target: id,
        sourceHandle: handleId ?? "out",
        targetHandle: null,
      } as any);

      connectingNodeRef.current = null;
      setDropMenu(null);
    },
    [dropMenu, addNode, onConnect]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <div className="flex-1 relative flex">
          <div className="flex-1">
            <ReactFlow
              nodes={nodes as any}
              edges={edges as any}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              onNodeClick={(_, node) => selectNode(node.id)}
              onPaneClick={() => selectNode(null)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{ type: "custom" }}
              fitView
              isValidConnection={(connection) => connection.source !== connection.target}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
          {selectedNodeId && <NodeEditPanel />}
        </div>
      </div>

      {dropMenu && (
        <EdgeDropMenu
          position={dropMenu.position}
          onSelect={handleDropMenuSelect}
          onClose={() => { setDropMenu(null); connectingNodeRef.current = null; }}
        />
      )}
    </div>
  );
}

export default function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
}
