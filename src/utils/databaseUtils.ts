
// Utility functions to handle OKR data persistence
import { Node, Edge, MarkerType } from '@xyflow/react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabaseClient';
import { OKRNode, OKREdge, OKRBoard, Objective, KeyResult } from '../services/supabaseClient';

// Type definitions for OKR data
export interface OKRData {
  nodes: Node[];
  edges: Edge[];
}

// Create a default board if none exists
const createDefaultBoard = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('okr_boards')
    .insert({
      user_id: userId,
      name: 'My OKR Board',
      description: 'Default OKR board'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create default board:', error);
    throw error;
  }

  return data.id;
};

// Get the first board ID for the user or create one
const getOrCreateBoardId = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('okr_boards')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to get board:', error);
    throw error;
  }

  if (data?.id) {
    return data.id;
  }

  // Create a default board if none exists
  return createDefaultBoard(userId);
};

// Convert xyflow Node to database format
const prepareObjectiveForDb = (node: Node, userId: string, boardId: number): Objective => {
  return {
    id: node.id,
    board_id: boardId,
    user_id: userId,
    parent_id: node.parentId,
    label: typeof node.data?.label === 'string' ? node.data.label : 'New Objective',
    description: typeof node.data?.description === 'string' ? node.data.description : '',
    progress: typeof node.data?.progress === 'number' ? node.data.progress : 0,
    department: typeof node.data?.department === 'string' ? node.data.department : null,
    position_x: node.position.x,
    position_y: node.position.y,
    style: node.style || null
  };
};

// Convert xyflow Node to database format for key results
const prepareKeyResultForDb = (node: Node, userId: string, objectiveId: string): KeyResult => {
  return {
    id: node.id,
    objective_id: objectiveId,
    user_id: userId,
    label: typeof node.data?.label === 'string' ? node.data.label : 'New Key Result',
    description: typeof node.data?.description === 'string' ? node.data.description : '',
    progress: typeof node.data?.progress === 'number' ? node.data.progress : 0,
    department: typeof node.data?.department === 'string' ? node.data.department : null,
    position_x: node.position.x,
    position_y: node.position.y,
    style: node.style || null
  };
};

// Convert xyflow Edge to database format
const prepareEdgeForDb = (edge: Edge, userId: string, boardId: number): any => {
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
const convertDbEdgeToEdge = (dbEdge: any): Edge => {
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

// Convert database Node (objective/key result) to xyflow Node
const convertDbNodeToNode = (dbNode: any, type: 'objective' | 'keyResult'): Node => {
  return {
    id: dbNode.id,
    type,
    position: { x: dbNode.position_x, y: dbNode.position_y },
    data: {
      label: dbNode.label,
      description: dbNode.description,
      progress: dbNode.progress,
      department: dbNode.department
    },
    style: dbNode.style,
    parentId: type === 'objective' ? dbNode.parent_id : undefined
  };
};

// Function to save OKR data to Supabase
export const saveOKRData = async (nodes: Node[], edges: Edge[]): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // If no user is authenticated, fall back to localStorage
      const okrData: OKRData = { nodes, edges };
      localStorage.setItem('okr-data', JSON.stringify(okrData));
      console.log('OKR data saved to localStorage (not authenticated)');
      return;
    }

    // Get or create a board for the user
    const boardId = await getOrCreateBoardId(user.id);

    // Begin transaction by storing nodes and edges
    const saveToDb = async () => {
      // Separate nodes by type
      const objectives = nodes.filter(node => node.type === 'objective');
      const keyResults = nodes.filter(node => node.type === 'keyResult');

      // Clear existing data for this board (this is a simple approach, could be optimized)
      await supabase.from('okr_edges').delete().eq('board_id', boardId);
      await supabase.from('key_results').delete().eq('user_id', user.id);
      await supabase.from('objectives').delete().eq('board_id', boardId);

      // Insert objectives
      if (objectives.length > 0) {
        const { error: objectivesError } = await supabase
          .from('objectives')
          .insert(objectives.map(node => prepareObjectiveForDb(node, user.id, boardId)));
        
        if (objectivesError) throw objectivesError;
      }

      // Insert key results
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
            keyResultInserts.push(prepareKeyResultForDb(kr, user.id, objectiveId));
          } else {
            // Fallback if no edge found (shouldn't happen in well-formed data)
            console.warn(`No connected objective found for key result ${kr.id}`);
            keyResultInserts.push(prepareKeyResultForDb(kr, user.id, 'unknown'));
          }
        }
        
        if (keyResultInserts.length > 0) {
          const { error: keyResultsError } = await supabase
            .from('key_results')
            .insert(keyResultInserts);
          
          if (keyResultsError) throw keyResultsError;
        }
      }

      // Insert edges
      if (edges.length > 0) {
        const { error: edgesError } = await supabase
          .from('okr_edges')
          .insert(edges.map(edge => prepareEdgeForDb(edge, user.id, boardId)));
        
        if (edgesError) throw edgesError;
      }
    };

    await saveToDb();
    toast.success('OKR data saved successfully');
    console.log('OKR data saved to database');
  } catch (error) {
    console.error('Failed to save OKR data:', error);
    toast.error('Failed to save your changes');
    
    // Fallback to localStorage on error
    try {
      const okrData: OKRData = { nodes, edges };
      localStorage.setItem('okr-data', JSON.stringify(okrData));
      console.log('OKR data saved to localStorage (fallback)');
    } catch (localError) {
      console.error('Failed to save to localStorage:', localError);
    }
  }
};

// Function to load OKR data from Supabase
export const loadOKRData = async (): Promise<OKRData | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // If no user is authenticated, fall back to localStorage
      const savedData = localStorage.getItem('okr-data');
      if (!savedData) return null;
      
      const okrData = JSON.parse(savedData) as OKRData;
      console.log('OKR data loaded from localStorage (not authenticated)');
      return okrData;
    }

    // Try to get a board for the user, or create one if none exists
    let boardId: number;
    try {
      boardId = await getOrCreateBoardId(user.id);
    } catch (error) {
      console.error('Failed to get or create board:', error);
      
      // Try loading from localStorage as fallback
      const savedData = localStorage.getItem('okr-data');
      if (!savedData) return null;
      
      const okrData = JSON.parse(savedData) as OKRData;
      console.log('OKR data loaded from localStorage (board error fallback)');
      return okrData;
    }

    // Load objectives from the database
    const { data: objectivesData, error: objectivesError } = await supabase
      .from('objectives')
      .select('*')
      .eq('board_id', boardId);

    if (objectivesError) {
      throw new Error(`Failed to load objectives: ${objectivesError.message}`);
    }

    // Load key results from the database
    const { data: keyResultsData, error: keyResultsError } = await supabase
      .from('key_results')
      .select('*')
      .eq('user_id', user.id);

    if (keyResultsError) {
      throw new Error(`Failed to load key results: ${keyResultsError.message}`);
    }

    // Load edges from the database
    const { data: edgesData, error: edgesError } = await supabase
      .from('okr_edges')
      .select('*')
      .eq('board_id', boardId);

    if (edgesError) {
      throw new Error(`Failed to load edges: ${edgesError.message}`);
    }

    // Convert to xyflow format
    const nodes: Node[] = [
      ...objectivesData.map(obj => convertDbNodeToNode(obj, 'objective')),
      ...keyResultsData.map(kr => convertDbNodeToNode(kr, 'keyResult'))
    ];

    const edges: Edge[] = edgesData.map(edge => convertDbEdgeToEdge(edge));

    console.log('OKR data loaded from database');
    return { nodes, edges };
  } catch (error) {
    console.error('Failed to load OKR data:', error);
    toast.error('Failed to load your data');
    
    // Attempt to load from localStorage on error
    try {
      const savedData = localStorage.getItem('okr-data');
      if (!savedData) return null;
      
      const okrData = JSON.parse(savedData) as OKRData;
      console.log('OKR data loaded from localStorage (fallback)');
      return okrData;
    } catch (localError) {
      console.error('Failed to load from localStorage:', localError);
      return null;
    }
  }
};

// Clear all stored OKR data
export const clearOKRData = async (): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user's boards
      const { data: boardsData } = await supabase
        .from('okr_boards')
        .select('id')
        .eq('user_id', user.id);

      if (boardsData && boardsData.length > 0) {
        // Delete all boards (will cascade to objectives, key results, and edges)
        const { error } = await supabase
          .from('okr_boards')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        console.log('OKR data cleared from database');
      }
    }
    
    // Always clear localStorage as well
    localStorage.removeItem('okr-data');
    console.log('OKR data cleared from localStorage');
    
    toast.success('All OKR data cleared successfully');
  } catch (error) {
    console.error('Failed to clear OKR data:', error);
    toast.error('Failed to clear your data');
  }
};
