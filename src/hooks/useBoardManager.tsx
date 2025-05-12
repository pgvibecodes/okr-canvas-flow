
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { saveOKRData, loadOKRData } from '../utils/databaseUtils';
import { supabase } from '../services/supabaseClient';

export function useBoardManager() {
  const [currentBoardId, setCurrentBoardId] = useState<number | undefined>(undefined);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Enhanced authentication status check
  useEffect(() => {
    const checkAuth = async () => {
      // Check current session
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setUser(data.session?.user || null);

      // Subscribe to auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session);
        setUser(session?.user || null);
        
        // When logging out, clear current board
        if (event === 'SIGNED_OUT') {
          setCurrentBoardId(undefined);
        }
      });
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);

  // Load board data with improved error handling
  const loadBoardData = useCallback(async (boardId: number) => {
    setIsLoading(true);
    try {
      const savedData = await loadOKRData(boardId);
      if (savedData) {
        toast.success('OKR data loaded successfully');
        return savedData;
      } else {
        // Return empty data if no saved data exists
        return { nodes: [], edges: [] };
      }
    } catch (error) {
      console.error('Error loading OKR data:', error);
      toast.error('Failed to load OKR data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save OKR data with RLS awareness
  const handleSave = useCallback(async (nodes, edges, boardId) => {
    if (!boardId) {
      toast.error('No board selected');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to save data');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveOKRData(nodes, edges, boardId);
      setUnsavedChanges(false);
      toast.success('OKR data saved successfully');
    } catch (error) {
      console.error('Error saving OKR data:', error);
      toast.error('Failed to save OKR data');
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated]);

  // Handle board change with RLS awareness
  const handleBoardChange = useCallback((boardId: number, nodes, edges, onBoardDataChange) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to change boards');
      return;
    }
    
    if (unsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Do you want to save them before switching boards?');
      if (confirm) {
        handleSave(nodes, edges, currentBoardId).then(() => {
          setCurrentBoardId(boardId);
        });
        return;
      }
    }
    setCurrentBoardId(boardId);
    loadBoardData(boardId).then(data => {
      if (data && onBoardDataChange) {
        onBoardDataChange(data);
      }
    });
  }, [currentBoardId, unsavedChanges, handleSave, loadBoardData, isAuthenticated]);

  return {
    currentBoardId,
    setCurrentBoardId,
    unsavedChanges,
    setUnsavedChanges,
    isLoading,
    isSaving,
    user,
    isAuthenticated,
    loadBoardData,
    handleSave,
    handleBoardChange
  };
}

export default useBoardManager;
