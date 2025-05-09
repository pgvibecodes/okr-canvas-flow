
import { useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Edge, Node, MarkerType } from '@xyflow/react';

// Helper function to update objective progress based on connected items
export const calculateObjectiveProgress = (
  objectiveId: string,
  nodes: Node[],
  edges: Edge[]
): number => {
  // Find the objective node
  const objectiveNode = nodes.find(node => node.id === objectiveId);
  if (!objectiveNode) return 0;
  
  // Find all key results connected to this objective
  const keyResultConnections = edges
    .filter(edge => 
      (edge.source === objectiveId && nodes.find(n => n.id === edge.target)?.type === 'keyResult') || 
      (edge.target === objectiveId && nodes.find(n => n.id === edge.source)?.type === 'keyResult')
    )
    .map(edge => {
      const keyResultId = edge.source === objectiveId ? edge.target : edge.source;
      return nodes.find(n => n.id === keyResultId);
    })
    .filter(kr => kr !== undefined);
  
  // Find all sub-objectives connected to this objective
  const subObjectiveConnections = edges
    .filter(edge => 
      (edge.source === objectiveId && nodes.find(n => n.id === edge.target)?.type === 'objective')
    )
    .map(edge => {
      return nodes.find(n => n.id === edge.target);
    })
    .filter(so => so !== undefined);
  
  // Calculate average progress including both key results and sub-objectives
  const totalItems = keyResultConnections.length + subObjectiveConnections.length;
  if (totalItems === 0) return 0; // No items to calculate progress from
  
  const totalProgress = 
    keyResultConnections.reduce((sum, kr) => {
      // Ensure we're dealing with numbers
      const progress = typeof kr?.data?.progress === 'number' ? kr.data.progress : 0;
      return sum + progress;
    }, 0) +
    subObjectiveConnections.reduce((sum, so) => {
      // Ensure we're dealing with numbers
      const progress = typeof so?.data?.progress === 'number' ? so.data.progress : 0;
      return sum + progress;
    }, 0);
  
  return Math.round(totalProgress / totalItems);
};

export const createObjectiveNode = (position: { x: number; y: number }) => {
  const id = `objective-${uuidv4()}`;
  return {
    id,
    type: 'objective',
    position,
    data: { 
      label: 'New Objective', 
      description: 'Click to edit',
      progress: 0,
    },
    style: {
      width: 260,
      background: '#f0f9ff',
      borderColor: '#3b82f6',
    },
  };
};

export const createKeyResultNode = (
  objectiveId: string, 
  position: { x: number; y: number },
  objectivePosition?: { x: number; y: number },
  offset?: number
) => {
  // Position the key result relative to its objective if position not provided
  const keyResultPos = position || {
    x: objectivePosition ? objectivePosition.x + 300 : 0,
    y: objectivePosition ? objectivePosition.y + (offset || 0) * 120 : 0
  };

  const id = `keyresult-${uuidv4()}`;
  const node = {
    id,
    type: 'keyResult',
    position: keyResultPos,
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
  };

  const edge = {
    id: `edge-${objectiveId}-${id}`,
    source: objectiveId,
    target: id,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed },
  };

  return { node, edge };
};
