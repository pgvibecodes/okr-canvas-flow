
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import useObjectiveNode from '@/hooks/useObjectiveNode';
import ObjectiveNodeHeader from './objective/ObjectiveNodeHeader';
import ObjectiveNodeContent from './objective/ObjectiveNodeContent';
import ObjectiveNodeFooter from './objective/ObjectiveNodeFooter';

const ObjectiveNode = ({ id, data }) => {
  const {
    isEditing,
    setIsEditing,
    label,
    setLabel,
    description,
    setDescription,
    progress,
    addKeyResult,
    addSubObjective,
    handleSave,
    handleDelete,
  } = useObjectiveNode(id, data);

  return (
    <Card className="border-2 border-blue-500 w-64 shadow-md">
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
        />
      </CardContent>
      <CardFooter className="p-0">
        <ObjectiveNodeFooter
          addSubObjective={addSubObjective}
          addKeyResult={addKeyResult}
        />
      </CardFooter>

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
    </Card>
  );
};

export default ObjectiveNode;
