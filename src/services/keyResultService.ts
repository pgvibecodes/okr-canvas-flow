
import { Node, Edge } from '@xyflow/react';
import { supabase } from './supabaseClient';
import { KeyResult } from './okrTypes';

// Convert xyflow Node to database format for key results
export const prepareKeyResultForDb = (node: Node, userId: string, objectiveId: string, boardId: number): KeyResult => {
  return {
    id: node.id,
    objective_id: objectiveId,
    user_id: userId,
    board_id: boardId, // Add board_id
    label: typeof node.data?.label === 'string' ? node.data.label : 'New Key Result',
    description: typeof node.data?.description === 'string' ? node.data.description : '',
    progress: typeof node.data?.progress === 'number' ? node.data.progress : 0,
    department: typeof node.data?.department === 'string' ? node.data.department : null,
    position_x: node.position.x,
    position_y: node.position.y,
    style: node.style || null
  };
};

// Convert database Node to xyflow Node
export const convertDbKeyResultToNode = (dbNode: any): Node => {
  return {
    id: dbNode.id,
    type: 'keyResult',
    position: { x: dbNode.position_x, y: dbNode.position_y },
    data: {
      label: dbNode.label,
      description: dbNode.description,
      progress: dbNode.progress,
      department: dbNode.department
    },
    style: dbNode.style
  };
};

// Save key results to database
export const saveKeyResults = async (
  keyResults: Node[],
  edges: Edge[],
  nodes: Node[],
  userId: string,
  boardId: number // Add boardId parameter
): Promise<void> => {
  if (keyResults.length > 0) {
    // Find the objective each key result belongs to
    const keyResultInserts = [];
    
    for (const kr of keyResults) {
      // Find connected objective through edges
      const edge = edges.find(e => 
        (e.source === kr.id && nodes.find(n => n.id === e.target && n.type === 'objective')) ||
        (e.target === kr.id && nodes.find(n => n.id === e.source && n.type === 'objective'))
      );
      
      if (edge) {
        const objectiveId = edge.source === kr.id ? edge.target : edge.source;
        keyResultInserts.push(prepareKeyResultForDb(kr, userId, objectiveId, boardId)); // Pass boardId
      } else {
        // Fallback if no edge found (shouldn't happen in well-formed data)
        console.warn(`No connected objective found for key result ${kr.id}`);
        keyResultInserts.push(prepareKeyResultForDb(kr, userId, 'unknown', boardId)); // Pass boardId
      }
    }
    
    if (keyResultInserts.length > 0) {
      const { error } = await supabase
        .from('key_results')
        .insert(keyResultInserts);
      
      if (error) throw error;
    }
  }
};

// Load key results from database
export const loadKeyResults = async (userId: string, boardId: number): Promise<Node[]> => {
  const { data, error } = await supabase
    .from('key_results')
    .select('*')
    .eq('user_id', userId)
    .eq('board_id', boardId); // Filter by board_id

  if (error) {
    throw new Error(`Failed to load key results: ${error.message}`);
  }

  return data.map(kr => convertDbKeyResultToNode(kr));
};

// Delete key results for a specific board
export const deleteKeyResults = async (boardId: number): Promise<void> => {
  const { error } = await supabase
    .from('key_results')
    .delete()
    .eq('board_id', boardId);
  
  if (error) throw error;
};
