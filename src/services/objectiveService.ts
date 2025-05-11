
import { Node } from '@xyflow/react';
import { supabase } from './supabaseClient';
import { Objective } from './okrTypes';

// Convert xyflow Node to database format
export const prepareObjectiveForDb = (node: Node, userId: string, boardId: number): Objective => {
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

// Convert database Node to xyflow Node
export const convertDbObjectiveToNode = (dbNode: any): Node => {
  return {
    id: dbNode.id,
    type: 'objective',
    position: { x: dbNode.position_x, y: dbNode.position_y },
    data: {
      label: dbNode.label,
      description: dbNode.description,
      progress: dbNode.progress,
      department: dbNode.department
    },
    style: dbNode.style,
    parentId: dbNode.parent_id
  };
};

// Save objectives to database
export const saveObjectives = async (
  objectives: Node[],
  userId: string,
  boardId: number
): Promise<void> => {
  if (objectives.length > 0) {
    const { error } = await supabase
      .from('objectives')
      .insert(objectives.map(node => prepareObjectiveForDb(node, userId, boardId)));
    
    if (error) throw error;
  }
};

// Load objectives from database
export const loadObjectives = async (boardId: number): Promise<Node[]> => {
  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('board_id', boardId);

  if (error) {
    throw new Error(`Failed to load objectives: ${error.message}`);
  }

  return data.map(obj => convertDbObjectiveToNode(obj));
};

// Delete objectives for a board
export const deleteObjectives = async (boardId: number): Promise<void> => {
  const { error } = await supabase
    .from('objectives')
    .delete()
    .eq('board_id', boardId);
  
  if (error) throw error;
};
