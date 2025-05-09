
import { useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { calculateObjectiveProgress } from '../utils/okrUtils';

export function useObjectiveProgress(
  nodes: any[], 
  edges: any[], 
  setNodes: ReturnType<typeof useNodesState>[1]
) {
  // Update parent objectives when child objectives change
  const updateParentObjectives = useCallback(() => {
    // Start by finding all objective-to-objective connections
    const hierarchyEdges = edges.filter(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      return sourceNode?.type === 'objective' && targetNode?.type === 'objective';
    });
    
    // Find all leaf objectives (those with no children)
    const leafObjectiveIds = new Set(
      nodes
        .filter(node => node.type === 'objective')
        .map(node => node.id)
    );
    
    // Remove any objectives that are parents
    hierarchyEdges.forEach(edge => {
      leafObjectiveIds.delete(edge.source);
    });
    
    // Process all leaf objectives first
    leafObjectiveIds.forEach(objId => {
      updateObjectiveProgress(objId);
    });
    
    // Then process up the hierarchy level by level
    let processed = new Set([...leafObjectiveIds]);
    let nextLevel = new Set();
    
    // Multiple passes to handle different hierarchy depths
    for (let i = 0; i < 5; i++) { // Max 5 levels of hierarchy
      hierarchyEdges.forEach(edge => {
        // If we've processed the target, we can process the source
        if (processed.has(edge.target) && !processed.has(edge.source)) {
          nextLevel.add(edge.source);
        }
      });
      
      // Process the next level
      nextLevel.forEach(objId => {
        updateObjectiveProgress(objId);
        processed.add(objId);
      });
      
      // If no more nodes to process, break
      if (nextLevel.size === 0) break;
      nextLevel = new Set();
    }
  }, [edges, nodes]);
  
  // Helper function to update objective progress
  const updateObjectiveProgress = useCallback((objectiveId) => {
    setNodes((nds) => {
      const progress = calculateObjectiveProgress(objectiveId, nds, edges);
      
      // Update objective progress
      return nds.map(node => 
        node.id === objectiveId
          ? { ...node, data: { ...node.data, progress } }
          : node
      );
    });
  }, [edges, setNodes]);

  // Effect to update objective progress when nodes or edges change
  useEffect(() => {
    // Small delay to ensure state is updated
    const timeoutId = setTimeout(() => {
      updateParentObjectives();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [edges, nodes, updateParentObjectives]);

  return { updateObjectiveProgress, updateParentObjectives };
}

export default useObjectiveProgress;
