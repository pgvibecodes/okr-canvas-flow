
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import ObjectiveNode from './nodes/ObjectiveNode';
import KeyResultNode from './nodes/KeyResultNode';
import FloatingActionBar from './FloatingActionBar';
import useObjectiveProgress from '../hooks/useObjectiveProgress';
import OKRConnectionHandler from './OKRConnectionHandler';
import OKRNodeHandler from './OKRNodeHandler';
import { saveOKRData, loadOKRData } from '../utils/databaseUtils';
import { Button } from './ui/button';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const nodeTypes = {
  objective: ObjectiveNode,
  keyResult: KeyResultNode,
};

const initialNodes = []; 
const initialEdges = [];

const OKRBoard = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use the progress hook
  const { updateObjectiveProgress, updateParentObjectives } = useObjectiveProgress(nodes, edges, setNodes);
  
  // Use the connection handler
  const { onConnect } = OKRConnectionHandler({ 
    nodes, 
    setEdges, 
    updateObjectiveProgress 
  });
  
  // Use the node handler
  const { addNewObjective, addKeyResult } = OKRNodeHandler({
    reactFlowInstance,
    nodes,
    edges,
    setNodes,
    setEdges,
    updateObjectiveProgress,
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Subscribe to auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session);
      });
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);

  // Load saved data on initial render
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const savedData = await loadOKRData();
        if (savedData) {
          setNodes(savedData.nodes || []);
          setEdges(savedData.edges || []);
          toast.success('OKR data loaded successfully');
        }
      } catch (error) {
        console.error('Error loading OKR data:', error);
        toast.error('Failed to load OKR data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [setNodes, setEdges, isAuthenticated]);

  // Track changes in nodes and edges to determine if there are unsaved changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setUnsavedChanges(true);
    }
  }, [nodes, edges]);

  // Save OKR data
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveOKRData(nodes, edges);
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving OKR data:', error);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  const handleCanvasClick = useCallback(
    (event) => {
      // Only add a node if command/ctrl key is pressed during click
      if (event.ctrlKey || event.metaKey) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        addNewObjective(position);
        setUnsavedChanges(true);
      }
    },
    [addNewObjective, reactFlowInstance, setUnsavedChanges]
  );

  // Auto-save functionality
  useEffect(() => {
    // Only save if there are nodes or edges to save and there are unsaved changes
    if (unsavedChanges && (nodes.length > 0 || edges.length > 0)) {
      const timeoutId = setTimeout(async () => {
        await saveOKRData(nodes, edges);
        setUnsavedChanges(false);
        console.log('Auto-saved OKR data');
      }, 5000); // Auto-save after 5 seconds of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, unsavedChanges]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg">Loading your OKR data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        onClick={handleCanvasClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        fitView
      >
        <Controls />
        <Background gap={16} color="#f1f5f9" />
        <Panel position="top-center" className="bg-white rounded-lg shadow-lg p-2">
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <p>Pan & Zoom the canvas. Hold Ctrl/Cmd + Click to add an objective.</p>
          </div>
        </Panel>
        <Panel position="top-right" className="mr-16">
          <div className="flex gap-2">
            {!isAuthenticated && (
              <div className="bg-amber-100 text-amber-800 rounded-md px-3 py-1 text-sm flex items-center">
                Not connected to database. Using localStorage.
              </div>
            )}
            <Button 
              onClick={handleSave}
              className={`flex items-center gap-2 ${unsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
              disabled={!unsavedChanges || isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Panel>
        <FloatingActionBar onAddObjective={addNewObjective} />
      </ReactFlow>
    </div>
  );
};

export default OKRBoard;
