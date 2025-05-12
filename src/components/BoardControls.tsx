
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import BoardSelector from './BoardSelector';

interface BoardControlsProps {
  currentBoardId: number | undefined;
  onBoardChange: (boardId: number) => void;
  onAddObjective: () => void;
  isAuthenticated: boolean;
}

const BoardControls: React.FC<BoardControlsProps> = ({
  currentBoardId,
  onBoardChange,
  onAddObjective,
  isAuthenticated
}) => {
  return (
    <div className="flex items-center gap-4">
      <BoardSelector currentBoardId={currentBoardId} onBoardChange={onBoardChange} />
      
      <Button onClick={onAddObjective} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white" size="sm">
        <Plus className="h-4 w-4" />
        Add Objective
      </Button>
      
      {!isAuthenticated && (
        <div className="bg-amber-100 text-amber-800 rounded-md px-3 py-1 text-sm flex items-center">
          Not connected to database. Using localStorage.
        </div>
      )}
    </div>
  );
};

export default BoardControls;
