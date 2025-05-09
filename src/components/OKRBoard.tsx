
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
  MarkerType
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
  
  // Helper function to update objective progress based on connected items
  const updateObjectiveProgress = useCallback((objectiveId) => {
    setNodes((nds) => {
      // Get the current nodes and edges
      const currentNodes = nds;
      const currentEdges = edges;
      
      // Find the objective node
      const objectiveNode = currentNodes.find(node => node.id === objectiveId);
      if (!objectiveNode) return nds;
      
      // Find all key results connected to this objective
      const keyResultConnections = currentEdges
        .filter(edge => 
          (edge.source === objectiveId && currentNodes.find(n => n.id === edge.target)?.type === 'keyResult') || 
          (edge.target === objectiveId && currentNodes.find(n => n.id === edge.source)?.type === 'keyResult')
        )
        .map(edge => {
          const keyResultId = edge.source === objectiveId ? edge.target : edge.source;
          return currentNodes.find(n => n.id === keyResultId);
        })
        .filter(kr => kr !== undefined);
      
      // Find all sub-objectives connected to this objective
      const subObjectiveConnections = currentEdges
        .filter(edge => 
          (edge.source === objectiveId && currentNodes.find(n => n.id === edge.target)?.type === 'objective')
        )
        .map(edge => {
          return currentNodes.find(n => n.id === edge.target);
        })
        .filter(so => so !== undefined);
      
      // Calculate average progress including both key results and sub-objectives
      const totalItems = keyResultConnections.length + subObjectiveConnections.length;
      if (totalItems === 0) return nds; // No items to calculate progress from
      
      const totalProgress = 
        keyResultConnections.reduce((sum, kr) => sum + kr.data.progress, 0) +
        subObjectiveConnections.reduce((sum, so) => sum + (so.data.progress || 0), 0);
      
      const avgProgress = Math.round(totalProgress / totalItems);
      
      // Update objective progress
      return nds.map(node => 
        node.id === objectiveId
          ? { ...node, data: { ...node.data, progress: avgProgress } }
          : node
      );
    });
  }, [edges, setNodes]);
  
  // Update parent objectives when child objectives change
  const updateParentObjectives = useCallback(() => {
    // Start by finding all objective-to-objective connections
    const hierarchyEdges = edges.filter(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      return sourceNode?.type === 'objective' && targetNode?.type === 'objective';
    });
    
    // Find all leaf objectives (those with no children)
    const leafObjectiveIds = new Set(
      nodes
        .filter(node => node.type === 'objective')
        .map(node => node.id)
    );
    
    // Remove any objectives that are parents
    hierarchyEdges.forEach(edge => {
      leafObjectiveIds.delete(edge.source);
    });
    
    // Process all leaf objectives first
    leafObjectiveIds.forEach(objId => {
      updateObjectiveProgress(objId);
    });
    
    // Then process up the hierarchy level by level
    let processed = new Set([...leafObjectiveIds]);
    let nextLevel = new Set();
    
    // Multiple passes to handle different hierarchy depths
    for (let i = 0; i < 5; i++) { // Max 5 levels of hierarchy
      hierarchyEdges.forEach(edge => {
        // If we've processed the target, we can process the source
        if (processed.has(edge.target) && !processed.has(edge.source)) {
          nextLevel.add(edge.source);
        }
      });
      
      // Process the next level
      nextLevel.forEach(objId => {
        updateObjectiveProgress(objId);
        processed.add(objId);
      });
      
      // If no more nodes to process, break
      if (nextLevel.size === 0) break;
      nextLevel = new Set();
    }
  }, [edges, nodes, updateObjectiveProgress]);
  
  // Effect to update objective progress when nodes or edges change
  useEffect(() => {
    // Small delay to ensure state is updated
    const timeoutId = setTimeout(() => {
      updateParentObjectives();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [edges, nodes, updateParentObjectives]);

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
      
      // Update progress after a short delay to ensure state is updated
      setTimeout(() => {
        if (sourceNode.type === 'objective') {
          updateObjectiveProgress(sourceNode.id);
        }
        if (targetNode.type === 'objective') {
          updateObjectiveProgress(targetNode.id);
        }
      }, 100);
    },
    [nodes, setEdges, updateObjectiveProgress]
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
      
      // Update objective progress after adding key result
      setTimeout(() => {
        updateObjectiveProgress(objectiveId);
      }, 100);
    },
    [nodes, edges, setNodes, setEdges, updateObjectiveProgress]
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
