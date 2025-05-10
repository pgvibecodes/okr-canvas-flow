
import { useState, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';

export function useKeyResultNode(id: string, data: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'New Key Result');
  const [description, setDescription] = useState(data.description || '');
  const [progress, setProgress] = useState(data.progress || 0);
  const [department, setDepartment] = useState(data.department || '');
  const reactFlow = useReactFlow();

  const handleSave = useCallback(() => {
    reactFlow.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label, description, progress, department } }
          : node
      )
    );
    setIsEditing(false);
    
    // Find connected objectives and update their progress
    updateConnectedObjectives();
    
    toast.success('Key result updated');
  }, [id, label, description, progress, department, reactFlow]);
  
  // Helper function to update the progress of connected objectives
  const updateConnectedObjectives = useCallback(() => {
    // Get current nodes and edges
    const edges = reactFlow.getEdges();
    const nodes = reactFlow.getNodes();
    
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
          const totalProgress = connectedKeyResults.reduce((sum, kr) => {
            // Ensure we're dealing with numbers by converting to number or using 0 as fallback
            const krProgress = typeof kr.data.progress === 'number' ? kr.data.progress : 0;
            return sum + krProgress;
          }, 0);
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
    // Get current nodes and edges
    const edges = reactFlow.getEdges();
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
      const updatedEdges = reactFlow.getEdges();
      const updatedNodes = reactFlow.getNodes();
      
      // For each previously connected edge, find the objective
      connectedEdges.forEach(edge => {
        const objectiveId = edge.source === id ? edge.target : edge.source;
        const objectiveNode = updatedNodes.find(node => node.id === objectiveId && node.type === 'objective');
        
        if (objectiveNode) {
          // Recalculate progress for this objective
          // Find all key results still connected to this objective
          const keyResultEdges = updatedEdges.filter(e => 
            (e.source === objectiveId || e.target === objectiveId) &&
            updatedNodes.find(n => (n.id === e.source || n.id === e.target) && n.type === 'keyResult')
          );
          
          const connectedKeyResults = keyResultEdges.map(e => {
            const keyResultId = e.source === objectiveId ? e.target : e.source;
            return updatedNodes.find(n => n.id === keyResultId && n.type === 'keyResult');
          }).filter(kr => kr !== undefined);
          
          // Calculate average progress or set to 0 if no key results
          const avgProgress = connectedKeyResults.length > 0
            ? Math.round(connectedKeyResults.reduce((sum, kr) => {
                // Ensure we're dealing with numbers by converting to number or using 0 as fallback
                const krProgress = typeof kr.data.progress === 'number' ? kr.data.progress : 0;
                return sum + krProgress;
              }, 0) / connectedKeyResults.length)
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

  return {
    isEditing,
    setIsEditing,
    label,
    setLabel,
    description,
    setDescription,
    progress,
    setProgress,
    department,
    setDepartment,
    handleSave,
    handleDelete
  };
}

export default useKeyResultNode;
