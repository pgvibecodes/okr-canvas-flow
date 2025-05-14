
import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { User, X } from 'lucide-react';
import { Permission } from './ShareForm';

export interface BoardShare {
  id: number;
  board_id: number;
  user_email: string;
  permission: Permission;
  created_at?: string;
}

interface SharedUsersListProps {
  sharedUsers: BoardShare[];
  onRemoveShare: (id: number) => Promise<void>;
}

const SharedUsersList: React.FC<SharedUsersListProps> = ({ 
  sharedUsers, 
  onRemoveShare 
}) => {
  if (sharedUsers.length === 0) {
    return null;
  }

  return (
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
              onClick={() => onRemoveShare(share.id)}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedUsersList;
