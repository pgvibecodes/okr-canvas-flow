
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import useObjectiveNode from '@/hooks/useObjectiveNode';
import ObjectiveNodeHeader from './objective/ObjectiveNodeHeader';
import ObjectiveNodeContent from './objective/ObjectiveNodeContent';
import NodeActionIcons from './NodeActionIcons';
import PlusIconMenu from './PlusIconMenu';

interface ObjectiveNodeProps {
  id: string;
  data: any;
  selected?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onPlusClick?: (nodeId: string, position: { x: number; y: number }) => void;
  onLinkClick?: (nodeId: string) => void;
  showPlusMenu?: boolean;
  plusMenuPosition?: { x: number; y: number };
  onClosePlusMenu?: () => void;
}

const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ 
  id, 
  data, 
  selected,
  onNodeClick,
  onPlusClick,
  onLinkClick,
  showPlusMenu,
  plusMenuPosition,
  onClosePlusMenu
}) => {
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

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeClick && !isEditing) {
      onNodeClick(id);
    }
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.right + 10,
      y: rect.top,
    };
    if (onPlusClick) {
      onPlusClick(id, position);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLinkClick) {
      onLinkClick(id);
    }
  };

  return (
    <div className="relative">
      <Card 
        className={`border-2 border-blue-500 w-64 shadow-md cursor-pointer transition-all ${
          selected ? 'ring-2 ring-blue-300 ring-offset-2' : ''
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

      {/* Action Icons - only show when selected and not editing */}
      <NodeActionIcons
        isVisible={selected && !isEditing}
        onPlusClick={handlePlusClick}
        onLinkClick={handleLinkClick}
      />

      {/* Plus Menu */}
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
