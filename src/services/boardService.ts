
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

// Clear all stored OKR data
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
