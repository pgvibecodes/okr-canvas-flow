import React, { useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ObjectiveNode from './nodes/ObjectiveNode';
import KeyResultNode from './nodes/KeyResultNode';
import OKRConnectionHandler from './OKRConnectionHandler';
import OKRNodeHandler from './OKRNodeHandler';
import useObjectiveProgress from '../hooks/useObjectiveProgress';
import useBoardManager from '../hooks/useBoardManager';
import LoadingIndicator from './LoadingIndicator';
import BoardShareDialog from './BoardShareDialog';
import OKRFlowContainer from './OKRFlowContainer';
import useDepartmentFilter from '../hooks/useDepartmentFilter';
import useAutoSave from '../hooks/useAutoSave';
import useConnectionMode from '../hooks/useConnectionMode';
import ConnectionDirectionDialog from './nodes/ConnectionDirectionDialog';

interface OKRBoardProps {
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (isOpen: boolean) => void;
}

const initialNodes = [];
const initialEdges = [];

const OKRBoard: React.FC<OKRBoardProps> = ({ isShareDialogOpen, setIsShareDialogOpen }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Connection mode state
  const connectionMode = useConnectionMode();
  
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

  // Use the department filtering hook
  const {
    departmentFilter,
    setDepartmentFilter,
    filteredNodes,
    filteredEdges
  } = useDepartmentFilter(nodes, edges);

  // Use the auto-save hook
  useAutoSave(nodes, edges, unsavedChanges, currentBoardId, setUnsavedChanges);

  // Handle connection attempt (opens dialog)
  const handleConnectionAttempt = useCallback((
    sourceNodeId: string,
    targetNodeId: string,
    sourceLabel: string,
    targetLabel: string
  ) => {
    connectionMode.openConnectionDialog(sourceNodeId, targetNodeId, sourceLabel, targetLabel);
  }, [connectionMode]);

  // Use the connection handler
  const {
    onConnect,
    createDirectionalEdge
  } = OKRConnectionHandler({
    nodes,
    setEdges,
    updateObjectiveProgress,
    currentBoardId,
    onConnectionAttempt: handleConnectionAttempt
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

  // Handle node actions
  const handleAddKeyResult = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const position = {
        x: node.position.x + 300,
        y: node.position.y,
      };
      addKeyResult(nodeId, position);
    }
  }, [nodes, addKeyResult]);

  const handleAddSubObjective = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const position = {
        x: node.position.x + 400,
        y: node.position.y + 100,
      };
      // For now, use the existing addNewObjective and create edge manually
      addNewObjective(position);
    }
  }, [nodes, addNewObjective]);

  const handleLinkClick = useCallback((nodeId: string) => {
    connectionMode.enterConnectionMode();
  }, [connectionMode]);

  // Handle connection direction selection
  const handleConnectionDirection = useCallback((direction: 'source-to-target' | 'target-to-source' | 'no-flow') => {
    const { sourceNodeId, targetNodeId } = connectionMode.connectionDialog;
    
    if (sourceNodeId && targetNodeId) {
      createDirectionalEdge(sourceNodeId, targetNodeId, direction);
    }
    
    connectionMode.closeConnectionDialog();
    connectionMode.exitConnectionMode();
  }, [connectionMode, createDirectionalEdge]);

  // Define node types after all dependencies are available
  const nodeTypes = {
    objective: (props: any) => (
      <ObjectiveNode
        {...props}
        onAddKeyResult={handleAddKeyResult}
        onAddSubObjective={handleAddSubObjective}
        onLinkClick={handleLinkClick}
        isConnectionMode={connectionMode.isConnectionMode}
      />
    ),
    keyResult: KeyResultNode
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        connectionMode.exitConnectionMode();
        connectionMode.closeConnectionDialog();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [connectionMode]);

  // Load saved data when board changes
  useEffect(() => {
    if (currentBoardId) {
      loadBoardData(currentBoardId).then(data => {
        if (data) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        } else {
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
    // Clear all node selections when clicking on canvas
    setNodes((nodes) => 
      nodes.map(node => ({
        ...node,
        selected: false
      }))
    );
    
    // Exit connection mode when clicking on canvas
    connectionMode.exitConnectionMode();
    
    // Only add a node if command/ctrl key is pressed during click
    if (event.ctrlKey || event.metaKey) {
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });
      addNewObjective(position);
      setUnsavedChanges(true);
    }
  }, [addNewObjective, reactFlowInstance, setUnsavedChanges, connectionMode, setNodes]);
  
  const handleDepartmentFilterChange = useCallback((department: string | null) => {
    setDepartmentFilter(department);
  }, [setDepartmentFilter]);
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  // Determine which nodes and edges to display
  const displayNodes = departmentFilter ? filteredNodes : nodes;
  const displayEdges = departmentFilter ? filteredEdges : edges;
  
  return (
    <>
      <OKRFlowContainer
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDragOver={onDragOver}
        onClick={handleCanvasClick}
        nodeTypes={nodeTypes}
        isShareDialogOpen={isShareDialogOpen}
        setIsShareDialogOpen={setIsShareDialogOpen}
        currentBoardId={currentBoardId}
        onBoardChange={handleBoardSelected}
        onAddObjective={() => addNewObjective({ x: 100, y: 100 })}
        isAuthenticated={isAuthenticated}
        departmentFilter={departmentFilter}
        onFilterChange={handleDepartmentFilterChange}
        isConnectionMode={connectionMode.isConnectionMode}
      />
      
      <BoardShareDialog 
        isOpen={isShareDialogOpen} 
        onClose={() => setIsShareDialogOpen(false)}
        boardId={currentBoardId}
      />

      <ConnectionDirectionDialog
        isOpen={connectionMode.connectionDialog.isOpen}
        onClose={connectionMode.closeConnectionDialog}
        sourceNodeLabel={connectionMode.connectionDialog.sourceLabel}
        targetNodeLabel={connectionMode.connectionDialog.targetLabel}
        onSelectDirection={handleConnectionDirection}
      />
    </>
  );
};

export default OKRBoard;
