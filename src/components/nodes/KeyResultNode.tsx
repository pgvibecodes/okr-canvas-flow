
import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Edit, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

const KeyResultNode = ({ id, data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'New Key Result');
  const [description, setDescription] = useState(data.description || '');
  const [progress, setProgress] = useState(data.progress || 0);
  const reactFlow = useReactFlow();

  const handleSave = useCallback(() => {
    reactFlow.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label, description, progress } }
          : node
      )
    );
    setIsEditing(false);
  }, [id, label, description, progress, reactFlow]);

  return (
    <Card className="border-2 border-rose-500 w-60 shadow-md">
      <CardHeader className="bg-rose-50 border-b border-rose-100 p-3">
        <div className="flex justify-between items-center">
          {isEditing ? (
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          ) : (
            <CardTitle className="text-lg font-medium text-rose-800">
              {label}
            </CardTitle>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="h-8 w-8"
          >
            {isEditing ? (
              <Check className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {isEditing ? (
          <>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              className="min-h-[60px] text-sm"
            />
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setProgress(value[0])}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">{description}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </>
        )}
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
