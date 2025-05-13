
import { toast } from 'sonner';
import { supabase } from './supabaseClient';

// Create a default board if none exists
export const createDefaultBoard = async (userId: string): Promise<number> => {
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
export const getOrCreateBoardId = async (userId: string): Promise<number> => {
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

// Clear all stored OKR boards
export const clearOKRBoards = async (userId: string): Promise<void> => {
  try {
    // Get user's boards
    const { data: boardsData } = await supabase
      .from('okr_boards')
      .select('id')
      .eq('user_id', userId);

    if (boardsData && boardsData.length > 0) {
      // Delete all boards (will cascade to objectives, key results, and edges)
      const { error } = await supabase
        .from('okr_boards')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      console.log('OKR data cleared from database');
    }
    
    toast.success('All OKR boards cleared successfully');
  } catch (error) {
    console.error('Failed to clear OKR boards:', error);
    throw error;
  }
};

// Get all boards for a user
export const getUserBoards = async (userId: string) => {
  const { data, error } = await supabase
    .from('okr_boards')
    .select('id, name, description, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get user boards:', error);
    throw error;
  }

  return data || [];
};

// Create a new board
export const createBoard = async (userId: string, name: string, description?: string) => {
  const { data, error } = await supabase
    .from('okr_boards')
    .insert({
      user_id: userId,
      name,
      description
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create board:', error);
    toast.error('Failed to create board');
    throw error;
  }

  toast.success('Board created successfully');
  return data.id;
};

// Update an existing board
export const updateBoard = async (boardId: number, updates: { name?: string; description?: string }) => {
  const { error } = await supabase
    .from('okr_boards')
    .update(updates)
    .eq('id', boardId);

  if (error) {
    console.error('Failed to update board:', error);
    toast.error('Failed to update board');
    throw error;
  }

  toast.success('Board updated successfully');
};

// Delete a board and all its associated data
export const deleteBoard = async (boardId: number) => {
  try {
    // Delete the board (cascades to objectives, key results, and edges)
    const { error } = await supabase
      .from('okr_boards')
      .delete()
      .eq('id', boardId);

    if (error) throw error;
    
    toast.success('Board deleted successfully');
  } catch (error) {
    console.error('Failed to delete board:', error);
    toast.error('Failed to delete board');
    throw error;
  }
};
