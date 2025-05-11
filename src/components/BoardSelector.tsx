
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { getUserBoards, createBoard } from '../services/boardService';
import { supabase } from '../services/supabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface Board {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

interface BoardSelectorProps {
  currentBoardId?: number;
  onBoardChange?: (boardId: number) => void;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({ currentBoardId, onBoardChange }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    checkAuth();
  }, []);

  // Load boards when user is authenticated
  useEffect(() => {
    if (userId) {
      loadBoards();
    }
  }, [userId]);

  // Set current board when boards are loaded and currentBoardId is provided
  useEffect(() => {
    if (boards.length > 0 && currentBoardId) {
      const board = boards.find(b => b.id === currentBoardId);
      if (board) {
        setCurrentBoard(board);
      } else if (boards.length > 0) {
        // If currentBoardId doesn't exist in boards, use the first one
        setCurrentBoard(boards[0]);
        if (onBoardChange) onBoardChange(boards[0].id);
      }
    } else if (boards.length > 0) {
      // If no currentBoardId is provided, use the first board
      setCurrentBoard(boards[0]);
      if (onBoardChange) onBoardChange(boards[0].id);
    }
  }, [boards, currentBoardId]);

  const loadBoards = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const boardsData = await getUserBoards(userId);
      setBoards(boardsData);
      
      if (boardsData.length === 0) {
        toast.info('Create your first OKR board to get started!');
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
      toast.error('Failed to load your boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!userId) {
      toast.error('You must be logged in to create a board');
      return;
    }

    if (!newBoardName.trim()) {
      toast.error('Board name is required');
      return;
    }

    try {
      const boardId = await createBoard(
        userId, 
        newBoardName.trim(), 
        newBoardDescription.trim() || undefined
      );
      
      setNewBoardOpen(false);
      setNewBoardName('');
      setNewBoardDescription('');
      
      // Reload boards to include the new one
      await loadBoards();
      
      // Select the newly created board
      if (onBoardChange) onBoardChange(boardId);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleSelectBoard = (board: Board) => {
    setCurrentBoard(board);
    if (onBoardChange) onBoardChange(board.id);
  };

  if (loading) {
    return <div className="h-8 flex items-center text-sm text-gray-500">Loading boards...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {currentBoard ? currentBoard.name : 'Select Board'} 
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Your Boards</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {boards.length > 0 ? (
            boards.map((board) => (
              <DropdownMenuItem 
                key={board.id}
                onClick={() => handleSelectBoard(board)}
                className={currentBoard?.id === board.id ? 'bg-muted' : ''}
              >
                {board.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No boards available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={newBoardOpen} onOpenChange={setNewBoardOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="px-2">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Board</DialogTitle>
            <DialogDescription>
              Add a new OKR board to manage your objectives and key results.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name"
                autoComplete="off"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea 
                id="description"
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                placeholder="Enter board description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewBoardOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard}>
              Create Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardSelector;
