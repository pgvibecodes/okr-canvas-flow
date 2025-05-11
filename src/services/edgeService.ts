
import { Edge, MarkerType } from '@xyflow/react';
import { supabase } from './supabaseClient';
import { OKREdge } from './okrTypes';

// Convert xyflow Edge to database format
export const prepareEdgeForDb = (edge: Edge, userId: string, boardId: number): OKREdge => {
  return {
    id: edge.id,
    source_id: edge.source,
    target_id: edge.target,
    board_id: boardId,
    user_id: userId,
    type: edge.type || null,
    animated: edge.animated || false,
    style: edge.style || null,
    label: edge.label ? String(edge.label) : null
  };
};

// Convert database Edge to xyflow Edge
export const convertDbEdgeToEdge = (dbEdge: any): Edge => {
  return {
    id: dbEdge.id,
    source: dbEdge.source_id,
    target: dbEdge.target_id,
    type: dbEdge.type,
    animated: dbEdge.animated,
    style: dbEdge.style,
    label: dbEdge.label,
    markerEnd: { type: MarkerType.ArrowClosed }
  };
};

// Save edges to database
export const saveEdges = async (
  edges: Edge[],
  userId: string,
  boardId: number
): Promise<void> => {
  if (edges.length > 0) {
    const { error } = await supabase
      .from('okr_edges')
      .insert(edges.map(edge => prepareEdgeForDb(edge, userId, boardId)));
    
    if (error) throw error;
  }
};

// Load edges from database
export const loadEdges = async (boardId: number): Promise<Edge[]> => {
  const { data, error } = await supabase
    .from('okr_edges')
    .select('*')
    .eq('board_id', boardId);

  if (error) {
    throw new Error(`Failed to load edges: ${error.message}`);
  }

  return data.map(edge => convertDbEdgeToEdge(edge));
};

// Delete edges for a board
export const deleteEdges = async (boardId: number): Promise<void> => {
  const { error } = await supabase
    .from('okr_edges')
    .delete()
    .eq('board_id', boardId);
  
  if (error) throw error;
};
