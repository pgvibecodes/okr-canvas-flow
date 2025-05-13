
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, ConnectionLineType, MarkerType, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ObjectiveNode from './nodes/ObjectiveNode';
import KeyResultNode from './nodes/KeyResultNode';
import OKRConnectionHandler from './OKRConnectionHandler';
import OKRNodeHandler from './OKRNodeHandler';
import useObjectiveProgress from '../hooks/useObjectiveProgress';
import useBoardManager from '../hooks/useBoardManager';
import BoardControls from './BoardControls';
import LoadingIndicator from './LoadingIndicator';
import { saveOKRData } from '../utils/databaseUtils';

const nodeTypes = {
  objective: ObjectiveNode,
  keyResult: KeyResultNode
};

const initialNodes = [];
const initialEdges = [];

const OKRBoard = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [filteredEdges, setFilteredEdges] = useState<any[]>([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Use the board manager hook
  const {
    currentBoardId,
    setCurrentBoardId,
    unsavedChanges,
    setUnsavedChanges,
    isLoading,
    isAuthenticated,
    loadBoardData,
    handleBoardChange
  } = useBoardManager();

  // Use the progress hook
  const {
    updateObjectiveProgress,
    updateParentObjectives
  } = useObjectiveProgress(nodes, edges, setNodes);

  // Use the connection handler
  const {
    onConnect
  } = OKRConnectionHandler({
    nodes,
    setEdges,
    updateObjectiveProgress,
    currentBoardId
  });

  // Use the node handler
  const {
    addNewObjective,
    addKeyResult
  } = OKRNodeHandler({
    reactFlowInstance,
    nodes,
    edges,
    setNodes,
    setEdges,
    updateObjectiveProgress,
    currentBoardId
  });

  // Filter nodes based on department
  useEffect(() => {
    if (!departmentFilter) {
      // No filter, show all nodes
      setFilteredNodes(nodes);
      setFilteredEdges(edges);
      return;
    }

    // Step 1: Find all nodes of the selected department
    const nodesWithDepartment = nodes.filter(node => 
      node.data?.department === departmentFilter
    );
    
    const relevantNodeIds = new Set<string>();
    
    // Step 2: Add all the department nodes to our set
    nodesWithDepartment.forEach(node => {
      relevantNodeIds.add(node.id);
    });
    
    // Step 3: For objectives in the department, add all child nodes
    const addChildrenRecursively = (nodeId: string) => {
      // Find all connections where this node is a source
      const childConnections = edges.filter(edge => edge.source === nodeId);
      
      childConnections.forEach(connection => {
        const targetId = connection.target;
        if (!relevantNodeIds.has(targetId)) {
          relevantNodeIds.add(targetId);
          // Recursively add children of this node
          addChildrenRecursively(targetId);
        }
      });
    };
    
    // Step 4: For key results in the department, add all parent objectives
    const addParentsRecursively = (nodeId: string) => {
      // Find all connections where this node is a target
      const parentConnections = edges.filter(edge => edge.target === nodeId);
      
      parentConnections.forEach(connection => {
        const sourceId = connection.source;
        if (!relevantNodeIds.has(sourceId)) {
          relevantNodeIds.add(sourceId);
          // Recursively add parents of this node
          addParentsRecursively(sourceId);
        }
      });
    };
    
    // Apply the recursive functions to the department nodes
    nodesWithDepartment.forEach(node => {
      if (node.type === 'objective') {
        addChildrenRecursively(node.id);
      } else if (node.type === 'keyResult') {
        addParentsRecursively(node.id);
      }
    });
    
    // Filter nodes and edges based on our set of relevant node IDs
    const filteredNodes = nodes.filter(node => relevantNodeIds.has(node.id));
    const filteredEdges = edges.filter(edge => 
      relevantNodeIds.has(edge.source) && relevantNodeIds.has(edge.target)
    );
    
    setFilteredNodes(filteredNodes);
    setFilteredEdges(filteredEdges);
  }, [departmentFilter, nodes, edges]);

  // Load saved data when board changes
  useEffect(() => {
    if (currentBoardId) {
      loadBoardData(currentBoardId).then(data => {
        if (data) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        } else {
          // Clear existing data if no saved data exists for this board
          setNodes([]);
          setEdges([]);
        }
      });
    }
  }, [currentBoardId, loadBoardData, setNodes, setEdges]);

  // Track changes in nodes and edges to determine if there are unsaved changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setUnsavedChanges(true);
    }
  }, [nodes, edges, setUnsavedChanges]);
  
  // Handle board change with the current nodes and edges
  const handleBoardSelected = useCallback((boardId: number) => {
    handleBoardChange(boardId, nodes, edges, (data) => {
      if (data) {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      }
    });
  }, [nodes, edges, handleBoardChange, setNodes, setEdges]);

  const onDragOver = useCallback(event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onInit = useCallback(instance => {
    setReactFlowInstance(instance);
  }, []);
  
  const handleCanvasClick = useCallback(event => {
    // Only add a node if command/ctrl key is pressed during click
    if (event.ctrlKey || event.metaKey) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });
      addNewObjective(position);
      setUnsavedChanges(true);
    }
  }, [addNewObjective, reactFlowInstance, setUnsavedChanges]);

  // Auto-save functionality
  useEffect(() => {
    // Only save if there are nodes or edges to save, there are unsaved changes, and a board is selected
    if (unsavedChanges && (nodes.length > 0 || edges.length > 0) && currentBoardId) {
      const timeoutId = setTimeout(async () => {
        await saveOKRData(nodes, edges, currentBoardId);
        setUnsavedChanges(false);
        console.log('Auto-saved OKR data');
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, unsavedChanges, currentBoardId, setUnsavedChanges]);
  
  // Handle department filter change
  const handleDepartmentFilterChange = useCallback((department: string | null) => {
    setDepartmentFilter(department);
  }, []);
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  // Determine which nodes and edges to display
  const displayNodes = departmentFilter ? filteredNodes : nodes;
  const displayEdges = departmentFilter ? filteredEdges : edges;
  
  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow 
        nodes={displayNodes} 
        edges={displayEdges} 
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
          style: {
            stroke: '#6366f1',
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed
          }
        }}
        fitView
      >
        <Controls />
        <Background gap={16} color="#f1f5f9" />
        
        {/* Bottom panel with board selector and add objective button */}
        <Panel position="bottom-center" className="bg-white rounded-lg shadow-lg p-2 mb-4">
          <BoardControls
            currentBoardId={currentBoardId}
            onBoardChange={handleBoardSelected}
            onAddObjective={() => addNewObjective({ x: 100, y: 100 })}
            isAuthenticated={isAuthenticated}
            nodes={nodes}
            departmentFilter={departmentFilter}
            onFilterChange={handleDepartmentFilterChange}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default OKRBoard;
