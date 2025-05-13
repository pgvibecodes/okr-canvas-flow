
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { getUserBoards, createBoard, updateBoard, deleteBoard } from '../services/boardService';
import { supabase } from '../services/supabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBoardId, setDeletingBoardId] = useState<number | null>(null);
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

  const handleOpenDialog = (isEdit = false, board?: Board) => {
    setIsEditing(isEdit);
    if (isEdit && board) {
      setBoardName(board.name);
      setBoardDescription(board.description || '');
      setEditingBoardId(board.id);
    } else {
      setBoardName('');
      setBoardDescription('');
      setEditingBoardId(null);
    }
    setDialogOpen(true);
  };

  const handleSaveBoard = async () => {
    if (!userId) {
      toast.error('You must be logged in to create a board');
      return;
    }

    if (!boardName.trim()) {
      toast.error('Board name is required');
      return;
    }

    try {
      if (isEditing && editingBoardId) {
        // Update existing board
        await updateBoard(editingBoardId, {
          name: boardName.trim(),
          description: boardDescription.trim() || undefined
        });
      } else {
        // Create new board
        const boardId = await createBoard(
          userId, 
          boardName.trim(), 
          boardDescription.trim() || undefined
        );
        
        // Select the newly created board
        if (onBoardChange) onBoardChange(boardId);
      }
      
      setDialogOpen(false);
      setBoardName('');
      setBoardDescription('');
      
      // Reload boards to reflect changes
      await loadBoards();
    } catch (error) {
      console.error('Failed to save board:', error);
    }
  };

  const handleDeleteBoard = async () => {
    if (!deletingBoardId) return;
    
    try {
      await deleteBoard(deletingBoardId);
      
      // If the deleted board was the current board, select another one
      if (currentBoard?.id === deletingBoardId && boards.length > 1) {
        const newBoardId = boards.find(b => b.id !== deletingBoardId)?.id;
        if (newBoardId && onBoardChange) {
          onBoardChange(newBoardId);
        }
      }
      
      // Reload boards
      await loadBoards();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const handleConfirmDelete = (boardId: number) => {
    setDeletingBoardId(boardId);
    setDeleteDialogOpen(true);
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
          
          {/* Add New Board option */}
          <DropdownMenuItem onSelect={() => handleOpenDialog(false)}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Add New Board</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {boards.length > 0 ? (
            boards.map((board) => (
              <div key={board.id} className="flex items-center justify-between">
                <DropdownMenuItem 
                  className="flex-1"
                  onClick={() => handleSelectBoard(board)}
                >
                  <span className={currentBoard?.id === board.id ? 'font-medium' : ''}>
                    {board.name}
                  </span>
                </DropdownMenuItem>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => handleOpenDialog(true, board)}>
                      <Edit className="h-4 w-4 mr-2" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleConfirmDelete(board.id)}
                      className="text-red-600 focus:text-red-600"
                      disabled={boards.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <DropdownMenuItem disabled>No boards available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for Creating/Editing Board */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Board' : 'Create a New Board'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update your board details below.'
                : 'Add a new OKR board to manage your objectives and key results.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Enter board name"
                autoComplete="off"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea 
                id="description"
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
                placeholder="Enter board description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBoard}>
              {isEditing ? 'Update' : 'Create'} Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deleting Board */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this board and all its objectives and key results.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBoard}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardSelector;
