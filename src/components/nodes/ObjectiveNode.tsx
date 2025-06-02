
import React from 'react';
import { Handle, Position, useReactFlow, NodeToolbar } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Link } from 'lucide-react';
import useObjectiveNode from '@/hooks/useObjectiveNode';
import ObjectiveNodeHeader from './objective/ObjectiveNodeHeader';
import ObjectiveNodeContent from './objective/ObjectiveNodeContent';
import PlusIconMenu from './PlusIconMenu';

interface ObjectiveNodeProps {
  id: string;
  data: any;
  selected?: boolean;
  onPlusClick?: (nodeId: string, position: { x: number; y: number }) => void;
  onLinkClick?: (nodeId: string) => void;
  showPlusMenu?: boolean;
  plusMenuPosition?: { x: number; y: number };
  onClosePlusMenu?: () => void;
  isConnectionMode?: boolean;
}

const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ 
  id, 
  data, 
  selected,
  onPlusClick,
  onLinkClick,
  showPlusMenu,
  plusMenuPosition,
  onClosePlusMenu,
  isConnectionMode
}) => {
  const reactFlow = useReactFlow();
  const {
    isEditing,
    setIsEditing,
    label,
    setLabel,
    description,
    setDescription,
    progress,
    department,
    setDepartment,
    addKeyResult,
    addSubObjective,
    handleSave,
    handleDelete,
  } = useObjectiveNode(id, data);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Plus button clicked for node:', id);
    
    // Get the node's position in the flow
    const node = reactFlow.getNode(id);
    if (node && onPlusClick) {
      // Use the node's position plus an offset for the menu
      const position = {
        x: node.position.x + 280, // Position to the right of the node
        y: node.position.y,
      };
      onPlusClick(id, position);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Link button clicked for node:', id);
    if (onLinkClick) {
      onLinkClick(id);
    }
  };

  console.log('ObjectiveNode render:', id, 'selected:', selected, 'isEditing:', isEditing);

  return (
    <div className="relative">
      <Card 
        className={`border-2 border-blue-500 w-64 shadow-md transition-all ${
          selected ? 'ring-2 ring-blue-300 ring-offset-2' : ''
        } ${
          isConnectionMode ? 'hover:ring-2 hover:ring-green-300 hover:ring-offset-2' : ''
        }`}
      >
        <CardHeader className="bg-blue-50 border-b border-blue-100 p-3">
          <ObjectiveNodeHeader
            isEditing={isEditing}
            label={label}
            setLabel={setLabel}
            handleSave={handleSave}
            setIsEditing={setIsEditing}
            handleDelete={handleDelete}
          />
        </CardHeader>
        <CardContent className="p-3">
          <ObjectiveNodeContent
            isEditing={isEditing}
            description={description}
            setDescription={setDescription}
            progress={progress}
            department={department}
            setDepartment={setDepartment}
          />
        </CardContent>
      </Card>

      {/* React Flow NodeToolbar - only show when selected and not editing */}
      <NodeToolbar isVisible={selected && !isEditing} position={Position.Top}>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white shadow-md hover:bg-blue-50"
            onClick={handlePlusClick}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white shadow-md hover:bg-blue-50"
            onClick={handleLinkClick}
          >
            <Link className="h-3 w-3" />
          </Button>
        </div>
      </NodeToolbar>

      {/* Plus Menu - now positioned relative to the flow */}
      {showPlusMenu && plusMenuPosition && (
        <PlusIconMenu
          isOpen={showPlusMenu}
          onClose={onClosePlusMenu || (() => {})}
          onAddSubObjective={addSubObjective}
          onAddKeyResult={addKeyResult}
          position={plusMenuPosition}
        />
      )}

      {/* React Flow handles */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#3b82f6', width: 8, height: 8, right: -4 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#3b82f6', width: 8, height: 8, left: -4 }}
      />
    </div>
  );
};

export default ObjectiveNode;
