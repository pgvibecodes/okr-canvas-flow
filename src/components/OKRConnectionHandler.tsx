
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Connection, Edge, Node, addEdge, MarkerType } from '@xyflow/react';
import { saveOKRData } from '../utils/databaseUtils';

interface OKRConnectionHandlerProps {
  nodes: Node[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  updateObjectiveProgress: (objectiveId: string) => void;
  currentBoardId?: number;
  onConnectionAttempt?: (sourceNodeId: string, targetNodeId: string, sourceLabel: string, targetLabel: string) => void;
}

function OKRConnectionHandler({ 
  nodes, 
  setEdges, 
  updateObjectiveProgress,
  currentBoardId,
  onConnectionAttempt
}: OKRConnectionHandlerProps) {
  const onConnect = useCallback(
    (params: Connection) => {
      // Get source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Allow connections between any node types
      const isValidConnection = true; // We'll handle validation in the dialog
      
      if (!isValidConnection) {
        toast.error('Invalid connection type');
        return;
      }

      // If we have a connection attempt handler, use it to open the dialog
      if (onConnectionAttempt) {
        onConnectionAttempt(
          sourceNode.id,
          targetNode.id,
          sourceNode.data.label || 'Node',
          targetNode.data.label || 'Node'
        );
        return;
      }
      
      // Fallback to direct connection (legacy behavior)
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
    [nodes, setEdges, updateObjectiveProgress, currentBoardId, onConnectionAttempt]
  );

  const createDirectionalEdge = useCallback((
    sourceId: string,
    targetId: string,
    direction: 'source-to-target' | 'target-to-source' | 'no-flow'
  ) => {
    const sourceNode = nodes.find(node => node.id === sourceId);
    const targetNode = nodes.find(node => node.id === targetId);
    
    if (!sourceNode || !targetNode) return;

    let edgeStyle: any = { strokeWidth: 2 };
    let markerEnd: any = undefined;
    let markerStart: any = undefined;
    let animated = false;

    // Determine edge styling based on direction and node types
    if (direction === 'source-to-target') {
      edgeStyle.stroke = '#6366f1';
      markerEnd = { type: MarkerType.ArrowClosed };
    } else if (direction === 'target-to-source') {
      edgeStyle.stroke = '#6366f1';
      markerStart = { type: MarkerType.ArrowClosed };
    } else { // no-flow
      edgeStyle.stroke = '#9ca3af';
      edgeStyle.strokeDasharray = '5,5';
    }

    // Special case: Key results always flow to objectives
    if (sourceNode.type === 'keyResult' && targetNode.type === 'objective') {
      edgeStyle.stroke = '#f43f5e';
      markerEnd = { type: MarkerType.ArrowClosed };
      markerStart = undefined;
    } else if (targetNode.type === 'keyResult' && sourceNode.type === 'objective') {
      edgeStyle.stroke = '#f43f5e';
      markerEnd = { type: MarkerType.ArrowClosed };
      markerStart = undefined;
    }

    setEdges((eds) => {
      const newEdge: Edge = {
        id: `edge-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        animated,
        style: edgeStyle,
        markerEnd,
        markerStart,
        data: { flowDirection: direction }
      };

      const newEdges = [...eds, newEdge];
      
      // Save changes to database
      setTimeout(() => {
        saveOKRData(nodes, newEdges, currentBoardId);
      }, 100);
      
      return newEdges;
    });

    toast.success('Connection created');
    
    // Update progress
    setTimeout(() => {
      if (sourceNode.type === 'objective') {
        updateObjectiveProgress(sourceNode.id);
      }
      if (targetNode.type === 'objective') {
        updateObjectiveProgress(targetNode.id);
      }
    }, 100);
  }, [nodes, setEdges, updateObjectiveProgress, currentBoardId]);

  return { onConnect, createDirectionalEdge };
}

export default OKRConnectionHandler;
