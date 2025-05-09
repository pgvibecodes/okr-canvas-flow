
import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Edit, Check, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

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
    
    // Find connected objectives and update their progress
    updateConnectedObjectives();
    
    toast.success('Key result updated');
  }, [id, label, description, progress, reactFlow]);
  
  // Helper function to update the progress of connected objectives
  const updateConnectedObjectives = useCallback(() => {
    const { edges, nodes } = reactFlow.getState();
    
    // Find all edges where this key result is connected
    const connectedEdges = edges.filter(
      edge => edge.source === id || edge.target === id
    );
    
    // For each connected edge, find the objective
    connectedEdges.forEach(edge => {
      const objectiveId = edge.source === id ? edge.target : edge.source;
      const objectiveNode = nodes.find(node => node.id === objectiveId && node.type === 'objective');
      
      if (objectiveNode) {
        // Find all key results connected to this objective
        const keyResultEdges = edges.filter(e => 
          (e.source === objectiveId || e.target === objectiveId) &&
          nodes.find(n => (n.id === e.source || n.id === e.target) && n.type === 'keyResult')
        );
        
        const connectedKeyResults = keyResultEdges.map(e => {
          const keyResultId = e.source === objectiveId ? e.target : e.source;
          return nodes.find(n => n.id === keyResultId && n.type === 'keyResult');
        }).filter(kr => kr !== undefined);
        
        // Calculate average progress
        if (connectedKeyResults.length > 0) {
          const totalProgress = connectedKeyResults.reduce((sum, kr) => sum + kr.data.progress, 0);
          const avgProgress = Math.round(totalProgress / connectedKeyResults.length);
          
          // Update objective progress
          reactFlow.setNodes(nodes => 
            nodes.map(node => 
              node.id === objectiveId 
                ? { ...node, data: { ...node.data, progress: avgProgress }} 
                : node
            )
          );
        }
      }
    });
  }, [id, reactFlow]);
  
  const handleDelete = useCallback(() => {
    // Find all edges connected to this node
    const { edges } = reactFlow.getState();
    const connectedEdges = edges.filter(
      edge => edge.source === id || edge.target === id
    );
    
    // Remove the edges first
    reactFlow.setEdges(edges => 
      edges.filter(edge => edge.source !== id && edge.target !== id)
    );
    
    // Remove the node
    reactFlow.setNodes(nodes => 
      nodes.filter(node => node.id !== id)
    );
    
    toast.success('Key result deleted');
    
    // Update connected objectives after a small delay to ensure state is updated
    setTimeout(() => {
      const { edges, nodes } = reactFlow.getState();
      
      // For each previously connected edge, find the objective
      connectedEdges.forEach(edge => {
        const objectiveId = edge.source === id ? edge.target : edge.source;
        const objectiveNode = nodes.find(node => node.id === objectiveId && node.type === 'objective');
        
        if (objectiveNode) {
          // Recalculate progress for this objective
          // Find all key results still connected to this objective
          const keyResultEdges = edges.filter(e => 
            (e.source === objectiveId || e.target === objectiveId) &&
            nodes.find(n => (n.id === e.source || n.id === e.target) && n.type === 'keyResult')
          );
          
          const connectedKeyResults = keyResultEdges.map(e => {
            const keyResultId = e.source === objectiveId ? e.target : e.source;
            return nodes.find(n => n.id === keyResultId && n.type === 'keyResult');
          }).filter(kr => kr !== undefined);
          
          // Calculate average progress or set to 0 if no key results
          const avgProgress = connectedKeyResults.length > 0
            ? Math.round(connectedKeyResults.reduce((sum, kr) => sum + kr.data.progress, 0) / connectedKeyResults.length)
            : 0;
          
          // Update objective progress
          reactFlow.setNodes(nodes => 
            nodes.map(node => 
              node.id === objectiveId 
                ? { ...node, data: { ...node.data, progress: avgProgress }} 
                : node
            )
          );
        }
      });
    }, 50);
  }, [id, reactFlow]);

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
          <div className="flex space-x-1">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
