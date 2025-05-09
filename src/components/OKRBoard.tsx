
import React, { useState, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ObjectiveNode from './nodes/ObjectiveNode';
import KeyResultNode from './nodes/KeyResultNode';
import FloatingActionBar from './FloatingActionBar';
import useObjectiveProgress from '../hooks/useObjectiveProgress';
import OKRConnectionHandler from './OKRConnectionHandler';
import OKRNodeHandler from './OKRNodeHandler';

const nodeTypes = {
  objective: ObjectiveNode,
  keyResult: KeyResultNode,
};

const initialNodes = []; 
const initialEdges = [];

const OKRBoard = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Use the progress hook
  const { updateObjectiveProgress, updateParentObjectives } = useObjectiveProgress(nodes, edges, setNodes);
  
  // Use the connection handler
  const { onConnect } = OKRConnectionHandler({ 
    nodes, 
    setEdges, 
    updateObjectiveProgress 
  });
  
  // Use the node handler
  const { addNewObjective, addKeyResult } = OKRNodeHandler({
    reactFlowInstance,
    nodes,
    edges,
    setNodes,
    setEdges,
    updateObjectiveProgress,
  });

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  const handleCanvasClick = useCallback(
    (event) => {
      // Only add a node if command/ctrl key is pressed during click
      if (event.ctrlKey || event.metaKey) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        addNewObjective(position);
      }
    },
    [addNewObjective, reactFlowInstance]
  );

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        onClick={handleCanvasClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        fitView
      >
        <Controls />
        <Background gap={16} color="#f1f5f9" />
        <Panel position="top-center" className="bg-white rounded-lg shadow-lg p-2">
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <p>Pan & Zoom the canvas. Hold Ctrl/Cmd + Click to add an objective.</p>
          </div>
        </Panel>
        <FloatingActionBar onAddObjective={addNewObjective} />
      </ReactFlow>
    </div>
  );
};

export default OKRBoard;
