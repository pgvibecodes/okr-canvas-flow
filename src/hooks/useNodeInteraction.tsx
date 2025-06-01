
import { useState, useCallback } from 'react';

interface NodeInteractionState {
  selectedNodeId: string | null;
  isConnectionMode: boolean;
  plusMenuState: {
    isOpen: boolean;
    position: { x: number; y: number };
    nodeId: string | null;
  };
  connectionDialog: {
    isOpen: boolean;
    sourceNodeId: string | null;
    targetNodeId: string | null;
    sourceLabel: string;
    targetLabel: string;
  };
}

export const useNodeInteraction = () => {
  const [state, setState] = useState<NodeInteractionState>({
    selectedNodeId: null,
    isConnectionMode: false,
    plusMenuState: {
      isOpen: false,
      position: { x: 0, y: 0 },
      nodeId: null,
    },
    connectionDialog: {
      isOpen: false,
      sourceNodeId: null,
      targetNodeId: null,
      sourceLabel: '',
      targetLabel: '',
    },
  });

  const selectNode = useCallback((nodeId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedNodeId: nodeId,
      plusMenuState: { ...prev.plusMenuState, isOpen: false },
    }));
  }, []);

  const enterConnectionMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnectionMode: true,
      plusMenuState: { ...prev.plusMenuState, isOpen: false },
    }));
  }, []);

  const exitConnectionMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnectionMode: false,
    }));
  }, []);

  const openPlusMenu = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      plusMenuState: {
        isOpen: true,
        position,
        nodeId,
      },
    }));
  }, []);

  const closePlusMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      plusMenuState: {
        ...prev.plusMenuState,
        isOpen: false,
      },
    }));
  }, []);

  const openConnectionDialog = useCallback((
    sourceNodeId: string,
    targetNodeId: string,
    sourceLabel: string,
    targetLabel: string
  ) => {
    setState(prev => ({
      ...prev,
      connectionDialog: {
        isOpen: true,
        sourceNodeId,
        targetNodeId,
        sourceLabel,
        targetLabel,
      },
    }));
  }, []);

  const closeConnectionDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      connectionDialog: {
        isOpen: false,
        sourceNodeId: null,
        targetNodeId: null,
        sourceLabel: '',
        targetLabel: '',
      },
    }));
  }, []);

  return {
    ...state,
    selectNode,
    enterConnectionMode,
    exitConnectionMode,
    openPlusMenu,
    closePlusMenu,
    openConnectionDialog,
    closeConnectionDialog,
  };
};
