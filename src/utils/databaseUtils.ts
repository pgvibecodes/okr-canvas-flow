
// Main OKR data persistence utilities
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';
import { OKRData } from '../services/okrTypes';
import { getOrCreateBoardId, clearOKRBoards } from '../services/boardService';
import { saveObjectives, deleteObjectives } from '../services/objectiveService';
import { saveKeyResults, deleteKeyResults } from '../services/keyResultService';
import { saveEdges, deleteEdges } from '../services/edgeService';

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
      await deleteEdges(boardId);
      await deleteKeyResults(user.id);
      await deleteObjectives(boardId);

      // Insert objectives
      await saveObjectives(objectives, user.id, boardId);

      // Insert key results
      await saveKeyResults(keyResults, edges, nodes, user.id);

      // Insert edges
      await saveEdges(edges, user.id, boardId);
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

    // Load data from all services
    const { loadObjectives } = await import('../services/objectiveService');
    const { loadKeyResults } = await import('../services/keyResultService');
    const { loadEdges } = await import('../services/edgeService');

    // Load objectives from the database
    const objectivesNodes = await loadObjectives(boardId);

    // Load key results from the database
    const keyResultNodes = await loadKeyResults(user.id);

    // Load edges from the database
    const edgesData = await loadEdges(boardId);

    // Combine all nodes
    const nodes = [...objectivesNodes, ...keyResultNodes];

    console.log('OKR data loaded from database');
    return { nodes, edges: edgesData };
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
      await clearOKRBoards(user.id);
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
