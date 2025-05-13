
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, Share, User, X } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

type Permission = 'view' | 'edit';

interface BoardShare {
  id: number;
  board_id: number;
  user_email: string;
  permission: Permission;
  created_at?: string;
}

interface BoardShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number | undefined;
}

const BoardShareDialog: React.FC<BoardShareDialogProps> = ({ isOpen, onClose, boardId }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<BoardShare[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Fetch existing shares when dialog opens or boardId changes
  useEffect(() => {
    if (isOpen && boardId) {
      fetchSharedUsers();
    }
  }, [isOpen, boardId]);

  const fetchSharedUsers = async () => {
    if (!boardId) return;
    
    const { data, error } = await supabase
      .from('board_shares')
      .select('*')
      .eq('board_id', boardId);
      
    if (error) {
      console.error('Error fetching shared users:', error);
      toast.error('Failed to load shared users');
    } else {
      setSharedUsers(data || []);
    }
  };

  const handleShareBoard = async () => {
    if (!email || !boardId) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if user exists by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        toast.error('User with this email does not exist');
        setIsSubmitting(false);
        return;
      }
      
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
        } else {
          toast.success(`Board shared with ${email}`);
          fetchSharedUsers();
        }
      }
      
      setEmail('');
      setPermission('view');
    } catch (error) {
      console.error('Error sharing board:', error);
      toast.error('An error occurred while sharing the board');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveShare = async (id: number) => {
    const { error } = await supabase
      .from('board_shares')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast.error('Failed to remove user access');
    } else {
      toast.success('User access removed');
      fetchSharedUsers();
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
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {permission === 'view' ? 'Can view' : 'Can edit'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="flex flex-col">
                <button
                  className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setPermission('view');
                    setIsPopoverOpen(false);
                  }}
                >
                  Can view
                  {permission === 'view' && <Check className="w-4 h-4" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setPermission('edit');
                    setIsPopoverOpen(false);
                  }}
                >
                  Can edit
                  {permission === 'edit' && <Check className="w-4 h-4" />}
                </button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={handleShareBoard} 
            disabled={!email || isSubmitting}
          >
            Share
          </Button>
        </div>
        
        {sharedUsers.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Shared with</h4>
            <div className="flex flex-col gap-2">
              {sharedUsers.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{share.user_email}</span>
                    <Badge 
                      variant={share.permission === 'edit' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {share.permission === 'edit' ? 'Editor' : 'Viewer'}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoardShareDialog;
