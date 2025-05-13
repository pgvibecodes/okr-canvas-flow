
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import BoardSelector from './BoardSelector';
import DepartmentFilter from './DepartmentFilter';
import { AlertCircle } from 'lucide-react';

interface BoardControlsProps {
  currentBoardId: number | undefined;
  onBoardChange: (boardId: number) => void;
  onAddObjective: () => void;
  isAuthenticated: boolean;
  nodes: any[];
  departmentFilter: string | null;
  onFilterChange: (department: string | null) => void;
}

const BoardControls: React.FC<BoardControlsProps> = ({
  currentBoardId,
  onBoardChange,
  onAddObjective,
  isAuthenticated,
  nodes,
  departmentFilter,
  onFilterChange
}) => {
  return (
    <div className="flex items-center gap-4">
      <BoardSelector currentBoardId={currentBoardId} onBoardChange={onBoardChange} />
      
      <DepartmentFilter 
        nodes={nodes} 
        currentFilter={departmentFilter} 
        onFilterChange={onFilterChange} 
      />
      
      <Button 
        onClick={onAddObjective} 
        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white" 
        size="sm"
        disabled={!isAuthenticated}
      >
        <Plus className="h-4 w-4" />
        Add Objective
      </Button>
      
      {!isAuthenticated && (
        <div className="bg-amber-100 text-amber-800 rounded-md px-3 py-1 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Not connected to database. Sign in to save your data.</span>
        </div>
      )}
    </div>
  );
};

export default BoardControls;
