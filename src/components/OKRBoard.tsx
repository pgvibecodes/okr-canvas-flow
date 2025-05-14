
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

interface OKRBoardProps {
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (isOpen: boolean) => void;
}

const nodeTypes = {
  objective: ObjectiveNode,
  keyResult: KeyResultNode
};

const initialNodes = [];
const initialEdges = [];

const OKRBoard: React.FC<OKRBoardProps> = ({ isShareDialogOpen, setIsShareDialogOpen }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
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

  // Use the department filtering hook
  const {
    departmentFilter,
    setDepartmentFilter,
    filteredNodes,
    filteredEdges
  } = useDepartmentFilter(nodes, edges);

  // Use the auto-save hook
  useAutoSave(nodes, edges, unsavedChanges, currentBoardId, setUnsavedChanges);

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
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });
      addNewObjective(position);
      setUnsavedChanges(true);
    }
  }, [addNewObjective, reactFlowInstance, setUnsavedChanges]);
  
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
      />
      
      <BoardShareDialog 
        isOpen={isShareDialogOpen} 
        onClose={() => setIsShareDialogOpen(false)}
        boardId={currentBoardId}
      />
    </>
  );
};

export default OKRBoard;
