
import { useState, useEffect } from 'react';

export function useDepartmentFilter(nodes, edges) {
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [filteredEdges, setFilteredEdges] = useState<any[]>([]);

  // Filter nodes based on department
  useEffect(() => {
    if (!departmentFilter) {
      // No filter, show all nodes
      setFilteredNodes(nodes);
      setFilteredEdges(edges);
      return;
    }

    // Step 1: Find all nodes of the selected department
    const nodesWithDepartment = nodes.filter(node => 
      node.data?.department === departmentFilter
    );
    
    const relevantNodeIds = new Set<string>();
    
    // Step 2: Add all the department nodes to our set
    nodesWithDepartment.forEach(node => {
      relevantNodeIds.add(node.id);
    });
    
    // Step 3: For objectives in the department, add all child nodes
    const addChildrenRecursively = (nodeId: string) => {
      // Find all connections where this node is a source
      const childConnections = edges.filter(edge => edge.source === nodeId);
      
      childConnections.forEach(connection => {
        const targetId = connection.target;
        if (!relevantNodeIds.has(targetId)) {
          relevantNodeIds.add(targetId);
          // Recursively add children of this node
          addChildrenRecursively(targetId);
        }
      });
    };
    
    // Step 4: For key results in the department, add all parent objectives
    const addParentsRecursively = (nodeId: string) => {
      // Find all connections where this node is a target
      const parentConnections = edges.filter(edge => edge.target === nodeId);
      
      parentConnections.forEach(connection => {
        const sourceId = connection.source;
        if (!relevantNodeIds.has(sourceId)) {
          relevantNodeIds.add(sourceId);
          // Recursively add parents of this node
          addParentsRecursively(sourceId);
        }
      });
    };
    
    // Apply the recursive functions to the department nodes
    nodesWithDepartment.forEach(node => {
      if (node.type === 'objective') {
        addChildrenRecursively(node.id);
      } else if (node.type === 'keyResult') {
        addParentsRecursively(node.id);
      }
    });
    
    // Filter nodes and edges based on our set of relevant node IDs
    const filteredNodes = nodes.filter(node => relevantNodeIds.has(node.id));
    const filteredEdges = edges.filter(edge => 
      relevantNodeIds.has(edge.source) && relevantNodeIds.has(edge.target)
    );
    
    setFilteredNodes(filteredNodes);
    setFilteredEdges(filteredEdges);
  }, [departmentFilter, nodes, edges]);

  return {
    departmentFilter,
    setDepartmentFilter,
    filteredNodes,
    filteredEdges
  };
}

export default useDepartmentFilter;
