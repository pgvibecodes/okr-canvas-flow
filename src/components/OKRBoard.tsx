import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel,
  ConnectionLineType,
  MarkerType,
  NodeMouseHandler
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import ObjectiveNode from './nodes/ObjectiveNode';
import KeyResultNode from './nodes/KeyResultNode';
import FloatingActionBar from './FloatingActionBar';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Calculate and update objective progress based on connected key results
  useEffect(() => {
    setNodes((nds) => {
      return nds.map(node => {
        // Only process objectives
        if (node.type !== 'objective') return node;
        
        // Find all key results connected to this objective
        const connectedKeyResults = edges
          .filter(edge => 
            (edge.source === node.id && nds.find(n => n.id === edge.target)?.type === 'keyResult') || 
            (edge.target === node.id && nds.find(n => n.id === edge.source)?.type === 'keyResult')
          )
          .map(edge => {
            const keyResultId = edge.source === node.id ? edge.target : edge.source;
            return nds.find(n => n.id === keyResultId);
          })
          .filter(kr => kr !== undefined);
        
        // If no key results, keep current progress
        if (connectedKeyResults.length === 0) return node;
        
        // Calculate average progress of connected key results
        const totalProgress = connectedKeyResults.reduce((sum, kr) => sum + kr.data.progress, 0);
        const avgProgress = Math.round(totalProgress / connectedKeyResults.length);
        
        // Update objective progress
        return {
          ...node,
          data: {
            ...node.data,
            progress: avgProgress
          }
        };
      });
    });
  }, [edges, setNodes]);

  const onConnect = useCallback(
    (params) => {
      // Get source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Allow connections between:
      // 1. Objective to Key Result
      // 2. Key Result to Objective
      // 3. Objective to Objective (new feature)
      const isValidConnection = (
        (sourceNode.type === 'objective' && targetNode.type === 'keyResult') ||
        (sourceNode.type === 'keyResult' && targetNode.type === 'objective') ||
        (sourceNode.type === 'objective' && targetNode.type === 'objective')
      );
      
      if (!isValidConnection) {
        toast.error('Invalid connection type');
        return;
      }
      
      setEdges((eds) => 
        addEdge({
          ...params,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }, eds)
      );
      
      toast.success('Connection created');
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  const addNewObjective = useCallback(
    (position) => {
      if (!reactFlowInstance) return;
      
      const id = `objective-${uuidv4()}`;
      const newNode = {
        id,
        type: 'objective',
        position,
        data: { 
          label: 'New Objective', 
          description: 'Click to edit',
          progress: 0,
        },
        style: {
          width: 260,
          background: '#f0f9ff',
          borderColor: '#3b82f6',
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success('Objective added');
    },
    [reactFlowInstance, setNodes]
  );

  const addKeyResult = useCallback(
    (objectiveId, position) => {
      if (!objectiveId) return;
      
      const objectiveNode = nodes.find(node => node.id === objectiveId);
      if (!objectiveNode) return;

      const offset = nodes.filter(node => 
        node.type === 'keyResult' && 
        edges.some(e => e.source === objectiveId && e.target === node.id)
      ).length;

      // Position the key result relative to its objective
      const objectivePos = objectiveNode.position;
      const keyResultPos = {
        x: position ? position.x : objectivePos.x + 300,
        y: position ? position.y : objectivePos.y + (offset * 120)
      };

      const id = `keyresult-${uuidv4()}`;
      const newNode = {
        id,
        type: 'keyResult',
        position: keyResultPos,
        data: { 
          label: 'New Key Result', 
          description: 'Click to edit',
          progress: 0,
        },
        style: {
          width: 240,
          background: '#fff1f2',
          borderColor: '#f43f5e',
        },
      };

      // Create the node
      setNodes((nds) => nds.concat(newNode));

      // Create an edge connecting the objective to the key result
      const newEdge = {
        id: `edge-${objectiveId}-${id}`,
        source: objectiveId,
        target: id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      setEdges((eds) => eds.concat(newEdge));
      toast.success('Key Result added');
    },
    [nodes, edges, setNodes, setEdges]
  );
  
  // Add handler for node deletion
  const onNodeDoubleClick = useCallback(
    (_, node) => {
      // Ask for confirmation before deletion
      if (window.confirm(`Delete this ${node.type}?`)) {
        // Remove the node
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        
        // Remove any connected edges
        setEdges((eds) => eds.filter(
          (e) => e.source !== node.id && e.target !== node.id
        ));
        
        toast.success(`${node.type === 'objective' ? 'Objective' : 'Key Result'} deleted`);
      }
    },
    [setNodes, setEdges]
  );

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
        onNodeDoubleClick={onNodeDoubleClick}
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
            <p>Pan & Zoom the canvas. Hold Ctrl/Cmd + Click to add an objective. Double-click to delete.</p>
          </div>
        </Panel>
        <FloatingActionBar onAddObjective={addNewObjective} />
      </ReactFlow>
    </div>
  );
};

export default OKRBoard;
