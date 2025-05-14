
import React, { useRef } from 'react';
import { ReactFlow, Background, Controls, Panel, ConnectionLineType, MarkerType } from '@xyflow/react';
import { Share } from 'lucide-react';
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
  onFilterChange
}) => {
  const reactFlowWrapper = useRef(null);

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
        
        {/* Top panel with share button */}
        <Panel position="top-right" className="mr-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 bg-white shadow-sm"
            onClick={() => setIsShareDialogOpen(true)}
            disabled={!isAuthenticated || !currentBoardId}
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </Panel>
        
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
      </ReactFlow>
    </div>
  );
};

export default OKRFlowContainer;
