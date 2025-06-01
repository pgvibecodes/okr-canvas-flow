
import React, { useRef } from 'react';
import { ReactFlow, Background, Controls, Panel, ConnectionLineType, MarkerType } from '@xyflow/react';
import { Button } from './ui/button';
import BoardControls from './BoardControls';

interface OKRFlowContainerProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onInit: any;
  onDragOver: any;
  onClick: any;
  nodeTypes: any;
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (isOpen: boolean) => void;
  currentBoardId?: number;
  onBoardChange: (boardId: number) => void;
  onAddObjective: () => void;
  isAuthenticated: boolean;
  departmentFilter: string | null;
  onFilterChange: (department: string | null) => void;
  isConnectionMode?: boolean;
}

const OKRFlowContainer: React.FC<OKRFlowContainerProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onDragOver,
  onClick,
  nodeTypes,
  isShareDialogOpen,
  setIsShareDialogOpen,
  currentBoardId,
  onBoardChange,
  onAddObjective,
  isAuthenticated,
  departmentFilter,
  onFilterChange,
  isConnectionMode
}) => {
  const reactFlowWrapper = useRef(null);

  return (
    <div 
      className={`h-full w-full ${isConnectionMode ? 'cursor-crosshair' : ''}`} 
      ref={reactFlowWrapper}
    >
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
        onConnect={onConnect} 
        onInit={onInit} 
        onDragOver={onDragOver} 
        nodeTypes={nodeTypes} 
        onClick={onClick}
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
            onBoardChange={onBoardChange}
            onAddObjective={onAddObjective}
            isAuthenticated={isAuthenticated}
            nodes={nodes}
            departmentFilter={departmentFilter}
            onFilterChange={onFilterChange}
          />
        </Panel>

        {/* Connection mode indicator */}
        {isConnectionMode && (
          <Panel position="top-center" className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            Connection mode active - Click on a node to connect, press ESC to cancel
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default OKRFlowContainer;
