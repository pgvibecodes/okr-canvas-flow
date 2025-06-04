
import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useObjectiveNode from '@/hooks/useObjectiveNode';
import ObjectiveNodeHeader from './objective/ObjectiveNodeHeader';
import ObjectiveNodeContent from './objective/ObjectiveNodeContent';
import InlineActionMenu from './InlineActionMenu';

interface ObjectiveNodeProps {
  id: string;
  data: any;
  selected?: boolean;
  onAddKeyResult?: (nodeId: string) => void;
  onAddSubObjective?: (nodeId: string) => void;
  onLinkClick?: (nodeId: string) => void;
  isConnectionMode?: boolean;
}

const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ 
  id, 
  data, 
  selected,
  onAddKeyResult,
  onAddSubObjective,
  onLinkClick,
  isConnectionMode
}) => {
  const { setNodes } = useReactFlow();
  const [showMenu, setShowMenu] = useState(false);
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

  const handleCardClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Select this node in React Flow
    setNodes((nodes) => 
      nodes.map(node => ({
        ...node,
        selected: node.id === id
      }))
    );
    
    // Show our local menu
    setShowMenu(true);
  }, [id, setNodes]);

  const handleAddKeyResult = () => {
    if (onAddKeyResult) {
      onAddKeyResult(id);
    } else {
      addKeyResult();
    }
  };

  const handleAddSubObjective = () => {
    if (onAddSubObjective) {
      onAddSubObjective(id);
    } else {
      addSubObjective();
    }
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick(id);
    }
  };

  // Menu is visible when either React Flow says it's selected OR our local state says so
  const isMenuVisible = selected || showMenu;

  return (
    <div className="relative">
      <Card 
        className={`border-2 border-blue-500 w-64 shadow-md transition-all cursor-pointer ${
          selected ? 'ring-2 ring-blue-300 ring-offset-2' : ''
        } ${
          isConnectionMode ? 'hover:ring-2 hover:ring-green-300 hover:ring-offset-2' : ''
        }`}
        onClick={handleCardClick}
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

      {/* Inline Action Menu - show when selected or locally visible */}
      <InlineActionMenu
        isVisible={isMenuVisible && !isEditing}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
        onAddSubObjective={handleAddSubObjective}
        onAddKeyResult={handleAddKeyResult}
        onLink={handleLinkClick}
      />

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
