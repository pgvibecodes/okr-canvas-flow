
import { useState, useCallback } from 'react';

export function useConnectionMode() {
  const [isConnectionMode, setIsConnectionMode] = useState(false);
  const [connectionDialog, setConnectionDialog] = useState({
    isOpen: false,
    sourceNodeId: '',
    targetNodeId: '',
    sourceLabel: '',
    targetLabel: ''
  });

  const enterConnectionMode = useCallback(() => {
    setIsConnectionMode(true);
  }, []);

  const exitConnectionMode = useCallback(() => {
    setIsConnectionMode(false);
  }, []);

  const openConnectionDialog = useCallback((
    sourceNodeId: string,
    targetNodeId: string,
    sourceLabel: string,
    targetLabel: string
  ) => {
    setConnectionDialog({
      isOpen: true,
      sourceNodeId,
      targetNodeId,
      sourceLabel,
      targetLabel
    });
  }, []);

  const closeConnectionDialog = useCallback(() => {
    setConnectionDialog({
      isOpen: false,
      sourceNodeId: '',
      targetNodeId: '',
      sourceLabel: '',
      targetLabel: ''
    });
  }, []);

  return {
    isConnectionMode,
    enterConnectionMode,
    exitConnectionMode,
    connectionDialog,
    openConnectionDialog,
    closeConnectionDialog
  };
}

export default useConnectionMode;
