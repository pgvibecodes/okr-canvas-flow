
import { useEffect } from 'react';
import { saveOKRData } from '../utils/databaseUtils';

export function useAutoSave(
  nodes: any[], 
  edges: any[], 
  unsavedChanges: boolean, 
  currentBoardId: number | undefined,
  setUnsavedChanges: (value: boolean) => void
) {
  // Auto-save functionality
  useEffect(() => {
    // Only save if there are nodes or edges to save, there are unsaved changes, and a board is selected
    if (unsavedChanges && (nodes.length > 0 || edges.length > 0) && currentBoardId) {
      const timeoutId = setTimeout(async () => {
        await saveOKRData(nodes, edges, currentBoardId);
        setUnsavedChanges(false);
        console.log('Auto-saved OKR data');
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, unsavedChanges, currentBoardId, setUnsavedChanges]);
}

export default useAutoSave;
