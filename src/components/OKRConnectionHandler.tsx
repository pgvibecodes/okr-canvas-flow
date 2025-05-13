
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Connection, Edge, Node, addEdge, MarkerType } from '@xyflow/react';
import { saveOKRData } from '../utils/databaseUtils';

interface OKRConnectionHandlerProps {
  nodes: Node[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  updateObjectiveProgress: (objectiveId: string) => void;
  currentBoardId?: number; // Add currentBoardId
}

function OKRConnectionHandler({ 
  nodes, 
  setEdges, 
  updateObjectiveProgress,
  currentBoardId 
}: OKRConnectionHandlerProps) {
  const onConnect = useCallback(
    (params: Connection) => {
      // Get source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Allow connections between:
      // 1. Objective to Key Result
      // 2. Key Result to Objective
      // 3. Objective to Objective (new feature)
      const isValidConnection = (
        (sourceNode.type === 'objective' && targetNode.type === 'keyResult') ||
        (sourceNode.type === 'keyResult' && targetNode.type === 'objective') ||
        (sourceNode.type === 'objective' && targetNode.type === 'objective')
      );
      
      if (!isValidConnection) {
        toast.error('Invalid connection type');
        return;
      }
      
      setEdges((eds) => {
        const newEdges = addEdge({
          ...params,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }, eds);
        
        // Save changes to database
        setTimeout(() => {
          saveOKRData(nodes, newEdges, currentBoardId);
        }, 100);
        
        return newEdges;
      });
      
      toast.success('Connection created');
      
      // Update progress after a short delay to ensure state is updated
      setTimeout(() => {
        if (sourceNode.type === 'objective') {
          updateObjectiveProgress(sourceNode.id);
        }
        if (targetNode.type === 'objective') {
          updateObjectiveProgress(targetNode.id);
        }
      }, 100);
    },
    [nodes, setEdges, updateObjectiveProgress, currentBoardId]
  );

  return { onConnect };
}

export default OKRConnectionHandler;
