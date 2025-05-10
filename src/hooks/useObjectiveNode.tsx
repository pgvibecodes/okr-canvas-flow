import { useState, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function useObjectiveNode(id: string, initialData: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(initialData.label || 'New Objective');
  const [description, setDescription] = useState(initialData.description || '');
  const [department, setDepartment] = useState(initialData.department || '');
  const reactFlow = useReactFlow();
  const progress = initialData.progress || 0;

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
    const keyResultId = `keyresult-${uuidv4()}`;
    
    // Create the key result node - inherit department from parent objective
    reactFlow.addNodes({
      id: keyResultId,
      type: 'keyResult',
      position,
      data: { 
        label: 'New Key Result', 
        description: 'Click to edit',
        progress: 0,
        department: department, // Inherit department from parent objective
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
    
    toast.success('Key result added');
  }, [id, reactFlow, department]);

  const addSubObjective = useCallback(() => {
    // Find the current node position
    const node = reactFlow.getNode(id);
    if (!node) return;

    // Calculate position for new sub-objective
    const position = {
      x: node.position.x + 400,
      y: node.position.y + 100,
    };

    // Generate a unique ID for the sub-objective
    const subObjectiveId = `objective-${uuidv4()}`;
    
    // Create the sub-objective node - inherit department from parent objective
    reactFlow.addNodes({
      id: subObjectiveId,
      type: 'objective',
      position,
      data: { 
        label: 'New Sub-Objective', 
        description: 'Click to edit',
        progress: 0,
        department: department, // Inherit department from parent objective
      },
      style: {
        width: 260,
        background: '#f0f9ff',
        borderColor: '#3b82f6',
      },
    });

    // Create the edge connecting objective to sub-objective
    reactFlow.addEdges({
      id: `edge-${id}-${subObjectiveId}`,
      source: id,
      target: subObjectiveId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });
    
    toast.success('Sub-objective added');
  }, [id, reactFlow, department]);

  const handleSave = useCallback(() => {
    reactFlow.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label, description, department } }
          : node
      )
    );
    setIsEditing(false);
    toast.success('Objective updated');
    
    // Propagate department to connected sub-objectives and key results
    propagateDepartmentToChildren(id, department);
  }, [id, label, description, department, reactFlow]);
  
  // Helper function to propagate department to children
  const propagateDepartmentToChildren = useCallback((objectiveId, dept) => {
    const nodes = reactFlow.getNodes();
    const edges = reactFlow.getEdges();
    
    // Find all edges where this objective is the source
    const childEdges = edges.filter(edge => edge.source === objectiveId);
    
    // Update department for all connected sub-objectives and key results
    childEdges.forEach(edge => {
      const childId = edge.target;
      const childNode = nodes.find(node => node.id === childId);
      
      if (childNode) {
        // Update the child node's department
        reactFlow.setNodes(nodes => 
          nodes.map(node => 
            node.id === childId
              ? { ...node, data: { ...node.data, department: dept }}
              : node
          )
        );
        
        // If the child is an objective, recursively propagate to its children
        if (childNode.type === 'objective') {
          propagateDepartmentToChildren(childId, dept);
        }
      }
    });
  }, [reactFlow]);
  
  const handleDelete = useCallback(() => {
    // Get the current state
    const nodes = reactFlow.getNodes();
    const edges = reactFlow.getEdges();
    
    // Find all edges connected to this node
    const connectedEdges = edges.filter(
      edge => edge.source === id || edge.target === id
    );
    
    // Find all directly connected nodes
    const connectedNodeIds = new Set(
      connectedEdges.flatMap(edge => [edge.source, edge.target])
    );
    connectedNodeIds.delete(id);
    
    // Find parent objective if this is a sub-objective
    const parentEdges = edges.filter(
      edge => (edge.target === id) && 
      nodes.find(n => n.id === edge.source && n.type === 'objective')
    );
    
    const parentIds = parentEdges.map(edge => edge.source);
    
    // Remove the edges first
    reactFlow.setEdges(edges => 
      edges.filter(edge => edge.source !== id && edge.target !== id)
    );
    
    // Remove the node
    reactFlow.setNodes(nodes => 
      nodes.filter(node => node.id !== id)
    );
    
    toast.success('Objective deleted');
    
    // Update parent objective progress if this was a sub-objective
    setTimeout(() => {
      const updatedNodes = reactFlow.getNodes();
      const updatedEdges = reactFlow.getEdges();
      
      // For each parent, recalculate progress
      parentIds.forEach(parentId => {
        const parentNode = updatedNodes.find(node => node.id === parentId);
        if (!parentNode) return;
        
        // Find all connected objectives and key results
        updateObjectiveProgress(parentId);
      });
    }, 50);
  }, [id, reactFlow]);
  
  // Helper function to update objective progress
  const updateObjectiveProgress = (objectiveId) => {
    const nodes = reactFlow.getNodes();
    const edges = reactFlow.getEdges();
    
    // Find all key results connected to this objective
    const keyResultEdges = edges.filter(e => 
      (e.source === objectiveId || e.target === objectiveId) &&
      nodes.find(n => (n.id === e.source || n.id === e.target) && n.type === 'keyResult')
    );
    
    const connectedKeyResults = keyResultEdges.map(e => {
      const keyResultId = e.source === objectiveId ? e.target : e.source;
      return nodes.find(n => n.id === keyResultId && n.type === 'keyResult');
    }).filter(kr => kr !== undefined);
    
    // Find all sub-objectives
    const subObjectiveEdges = edges.filter(e => 
      e.source === objectiveId && 
      nodes.find(n => n.id === e.target && n.type === 'objective')
    );
    
    const subObjectives = subObjectiveEdges.map(e => 
      nodes.find(n => n.id === e.target && n.type === 'objective')
    ).filter(o => o !== undefined);
    
    // Calculate average progress from key results and sub-objectives
    let totalItems = connectedKeyResults.length + subObjectives.length;
    let totalProgress = connectedKeyResults.reduce((sum, kr) => {
      // Ensure we're dealing with numbers by converting to number or using 0 as fallback
      const krProgress = typeof kr.data.progress === 'number' ? kr.data.progress : 0;
      return sum + krProgress;
    }, 0) + subObjectives.reduce((sum, so) => {
      // Ensure we're dealing with numbers by converting to number or using 0 as fallback
      const soProgress = typeof so.data.progress === 'number' ? so.data.progress : 0;
      return sum + soProgress;
    }, 0);
    
    // Calculate average or default to 0
    const avgProgress = totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;
    
    // Update objective progress
    reactFlow.setNodes(nodes => 
      nodes.map(node => 
        node.id === objectiveId 
          ? { ...node, data: { ...node.data, progress: avgProgress }} 
          : node
      )
    );
    
    // Find parent objective and update its progress as well
    const parentEdges = edges.filter(
      edge => (edge.target === objectiveId) && 
      nodes.find(n => n.id === edge.source && n.type === 'objective')
    );
    
    parentEdges.forEach(edge => {
      updateObjectiveProgress(edge.source);
    });
  };

  return {
    isEditing,
    setIsEditing,
    label,
    setLabel,
    description,
    setDescription,
    department,
    setDepartment,
    progress,
    addKeyResult,
    addSubObjective,
    handleSave,
    handleDelete,
  };
}

export default useObjectiveNode;
