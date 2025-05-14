
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Share } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

import ShareForm, { Permission } from './board-share/ShareForm';
import SharedUsersList, { BoardShare } from './board-share/SharedUsersList';

interface BoardShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number | undefined;
}

const BoardShareDialog: React.FC<BoardShareDialogProps> = ({ isOpen, onClose, boardId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<BoardShare[]>([]);

  // Fetch existing shares when dialog opens or boardId changes
  useEffect(() => {
    if (isOpen && boardId) {
      fetchSharedUsers();
    }
  }, [isOpen, boardId]);

  const fetchSharedUsers = async () => {
    if (!boardId) return;
    
    try {
      const { data, error } = await supabase
        .from('board_shares')
        .select('*')
        .eq('board_id', boardId);
        
      if (error) {
        console.error('Error fetching shared users:', error);
        toast.error('Failed to load shared users');
      } else {
        // Cast the data to ensure it matches our BoardShare type
        // The permission from DB is guaranteed to be either 'view' or 'edit' by the CHECK constraint
        setSharedUsers((data || []) as BoardShare[]);
      }
    } catch (error) {
      console.error('Failed to fetch shared users:', error);
      toast.error('An error occurred while loading shared users');
    }
  };

  const handleShareBoard = async (email: string, permission: Permission) => {
    if (!email || !boardId) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if share already exists
      const { data: existingShare } = await supabase
        .from('board_shares')
        .select('*')
        .eq('board_id', boardId)
        .eq('user_email', email);
        
      if (existingShare && existingShare.length > 0) {
        // Update existing share
        const { error: updateError } = await supabase
          .from('board_shares')
          .update({ permission })
          .eq('id', existingShare[0].id);
          
        if (updateError) {
          toast.error('Failed to update share');
          console.error('Error updating share:', updateError);
        } else {
          toast.success(`Updated share for ${email}`);
          fetchSharedUsers();
        }
      } else {
        // Create new share
        const { error: insertError } = await supabase
          .from('board_shares')
          .insert({
            board_id: boardId,
            user_email: email,
            permission
          });
          
        if (insertError) {
          toast.error('Failed to share board');
          console.error('Error sharing board:', insertError);
        } else {
          toast.success(`Board shared with ${email}`);
          fetchSharedUsers();
        }
      }
    } catch (error) {
      console.error('Error sharing board:', error);
      toast.error('An error occurred while sharing the board');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveShare = async (id: number) => {
    try {
      const { error } = await supabase
        .from('board_shares')
        .delete()
        .eq('id', id);
        
      if (error) {
        toast.error('Failed to remove user access');
        console.error('Error removing share:', error);
      } else {
        toast.success('User access removed');
        fetchSharedUsers();
      }
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error('An error occurred while removing user access');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share size={16} /> Share Board
          </DialogTitle>
          <DialogDescription>
            Share this board with other users by email
          </DialogDescription>
        </DialogHeader>
        
        <ShareForm 
          onShare={handleShareBoard} 
          isSubmitting={isSubmitting} 
        />
        
        <SharedUsersList 
          sharedUsers={sharedUsers}
          onRemoveShare={handleRemoveShare}
        />
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoardShareDialog;
