
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ReactFlowInstance } from '@xyflow/react';
import { createObjectiveNode, createKeyResultNode } from '../utils/okrUtils';
import { saveOKRData } from '../utils/databaseUtils';

interface OKRNodeHandlerProps {
  reactFlowInstance: ReactFlowInstance | null;
  nodes: any[];
  edges: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
  updateObjectiveProgress: (objectiveId: string) => void;
}

function OKRNodeHandler({
  reactFlowInstance,
  nodes,
  edges,
  setNodes,
  setEdges,
  updateObjectiveProgress,
}: OKRNodeHandlerProps) {
  const addNewObjective = useCallback(
    (position) => {
      if (!reactFlowInstance) return;
      
      const newNode = createObjectiveNode(position);
      setNodes((nds) => nds.concat(newNode));
      toast.success('Objective added');
      
      // Save changes to database
      setTimeout(() => {
        const updatedNodes = [...nodes, newNode];
        saveOKRData(updatedNodes, edges);
      }, 100);
    },
    [reactFlowInstance, setNodes, nodes, edges]
  );

  const addKeyResult = useCallback(
    (objectiveId, position) => {
      if (!objectiveId) return;
      
      const objectiveNode = nodes.find(node => node.id === objectiveId);
      if (!objectiveNode) return;

      const offset = nodes.filter(node => 
        node.type === 'keyResult' && 
        edges.some(e => e.source === objectiveId && e.target === node.id)
      ).length;

      // Get department from parent objective to pass to key result
      const department = objectiveNode.data.department || '';

      // Create the key result with its edge
      const { node: newNode, edge: newEdge } = createKeyResultNode(
        objectiveId, 
        position, 
        objectiveNode.position, 
        offset,
        department // Pass department from parent objective
      );

      // Create the node
      setNodes((nds) => nds.concat(newNode));

      // Create the edge
      setEdges((eds) => eds.concat(newEdge));

      toast.success('Key Result added');
      
      // Update objective progress after adding key result
      setTimeout(() => {
        updateObjectiveProgress(objectiveId);
      }, 100);
      
      // Save changes to database
      setTimeout(() => {
        const updatedNodes = [...nodes, newNode];
        const updatedEdges = [...edges, newEdge];
        saveOKRData(updatedNodes, updatedEdges);
      }, 200);
    },
    [nodes, edges, setNodes, setEdges, updateObjectiveProgress]
  );

  return { addNewObjective, addKeyResult };
}

export default OKRNodeHandler;
