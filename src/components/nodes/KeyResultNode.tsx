
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useKeyResultNode from '@/hooks/useKeyResultNode';
import KeyResultNodeHeader from './keyResult/KeyResultNodeHeader';
import KeyResultNodeContent from './keyResult/KeyResultNodeContent';

const KeyResultNode = ({ id, data }) => {
  const {
    isEditing,
    setIsEditing,
    label,
    setLabel,
    description,
    setDescription,
    progress,
    setProgress,
    handleSave,
    handleDelete
  } = useKeyResultNode(id, data);

  return (
    <Card className="border-2 border-rose-500 w-60 shadow-md">
      <CardHeader className="bg-rose-50 border-b border-rose-100 p-3">
        <KeyResultNodeHeader
          isEditing={isEditing}
          label={label}
          setLabel={setLabel}
          handleSave={handleSave}
          setIsEditing={setIsEditing}
          handleDelete={handleDelete}
        />
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <KeyResultNodeContent
          isEditing={isEditing}
          description={description}
          setDescription={setDescription}
          progress={progress}
          setProgress={setProgress}
        />
      </CardContent>

      {/* React Flow handles */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#f43f5e', width: 8, height: 8, right: -4 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#f43f5e', width: 8, height: 8, left: -4 }}
      />
    </Card>
  );
};

export default KeyResultNode;
