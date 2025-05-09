
import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Check } from 'lucide-react';

const ObjectiveNode = ({ id, data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'New Objective');
  const [description, setDescription] = useState(data.description || '');
  const reactFlow = useReactFlow();

  const addKeyResult = useCallback(() => {
    // Find the current node position
    const node = reactFlow.getNode(id);
    if (!node) return;

    // Calculate position for new key result
    const position = {
      x: node.position.x + 300,
      y: node.position.y,
    };

    // Generate a unique ID for the key result
    const keyResultId = `keyresult-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the key result node
    reactFlow.addNodes({
      id: keyResultId,
      type: 'keyResult',
      position,
      data: { 
        label: 'New Key Result', 
        description: 'Click to edit',
        progress: 0,
      },
      style: {
        width: 240,
        background: '#fff1f2',
        borderColor: '#f43f5e',
      },
    });

    // Create the edge connecting objective to key result
    reactFlow.addEdges({
      id: `edge-${id}-${keyResultId}`,
      source: id,
      target: keyResultId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });
  }, [id, reactFlow]);

  const handleSave = useCallback(() => {
    reactFlow.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label, description } }
          : node
      )
    );
    setIsEditing(false);
  }, [id, label, description, reactFlow]);

  return (
    <Card className="border-2 border-blue-500 w-64 shadow-md">
      <CardHeader className="bg-blue-50 border-b border-blue-100 p-3">
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
            <CardTitle className="text-lg font-medium text-blue-800">
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
      <CardContent className="p-3">
        {isEditing ? (
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
            className="min-h-[60px] text-sm"
          />
        ) : (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-end">
        <Button 
          onClick={addKeyResult}
          size="sm" 
          variant="outline"
          className="text-xs flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add Key Result
        </Button>
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
