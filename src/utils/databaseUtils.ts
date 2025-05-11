
// Utility functions to handle OKR data persistence
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { OKRNode, OKREdge, SavedOKRData } from '../services/supabaseClient';

// Type definitions for OKR data
export interface OKRData {
  nodes: Node[];
  edges: Edge[];
}

// Convert xyflow Node to OKRNode type
const convertToOKRNodes = (nodes: Node[]): OKRNode[] => {
  return nodes.map(node => ({
    id: node.id,
    type: node.type || 'default',
    position: node.position,
    data: node.data || {},
    style: node.style,
    parentId: node.parentId,
    extent: node.extent ? (typeof node.extent === 'string' ? node.extent : 'parent') : undefined
  }));
};

// Convert xyflow Edge to OKREdge type
const convertToOKREdges = (edges: Edge[]): OKREdge[] => {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
    animated: edge.animated,
    style: edge.style,
    markerEnd: edge.markerEnd ? 
      (typeof edge.markerEnd === 'string' ? edge.markerEnd : { type: edge.markerEnd }) : 
      undefined,
    sourceHandle: edge.sourceHandle,
    label: edge.label ? String(edge.label) : undefined
  }));
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

    // Check if user already has saved OKR data
    const { data: existingData, error: fetchError } = await supabase
      .from('okr_data')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to check existing data: ${fetchError.message}`);
    }

    // Convert nodes and edges to OKRNode[] and OKREdge[] types
    const okrNodes = convertToOKRNodes(nodes);
    const okrEdges = convertToOKREdges(edges);

    const okrData: SavedOKRData = {
      user_id: user.id,
      nodes: okrNodes,
      edges: okrEdges,
      updated_at: new Date().toISOString(),
    };

    // If user has existing data, update it; otherwise, insert new record
    if (existingData?.id) {
      const { error } = await supabase
        .from('okr_data')
        .update(okrData)
        .eq('id', existingData.id);

      if (error) throw error;
      console.log('OKR data updated in Supabase');
    } else {
      okrData.created_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('okr_data')
        .insert(okrData);

      if (error) throw error;
      console.log('OKR data inserted into Supabase');
    }

    toast.success('OKR data saved successfully');
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

    // Load data from Supabase
    const { data, error } = await supabase
      .from('okr_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load data: ${error.message}`);
    }

    if (data) {
      console.log('OKR data loaded from Supabase');
      return { nodes: data.nodes as unknown as Node[], edges: data.edges as unknown as Edge[] };
    }
    
    // No data found in Supabase, check localStorage
    const savedData = localStorage.getItem('okr-data');
    if (!savedData) return null;
    
    const localData = JSON.parse(savedData) as OKRData;
    console.log('OKR data loaded from localStorage (no Supabase data)');
    
    // Save localStorage data to Supabase for future use
    await saveOKRData(localData.nodes, localData.edges);
    
    return localData;
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
      // Delete from Supabase if user is authenticated
      const { error } = await supabase
        .from('okr_data')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      console.log('OKR data cleared from Supabase');
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
