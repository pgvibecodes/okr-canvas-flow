
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Link } from 'lucide-react';

interface InlineActionMenuProps {
  isVisible: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubObjective: () => void;
  onAddKeyResult: () => void;
  onLink: () => void;
}

const InlineActionMenu: React.FC<InlineActionMenuProps> = ({
  isVisible,
  isEditing,
  onEdit,
  onDelete,
  onAddSubObjective,
  onAddKeyResult,
  onLink
}) => {
  if (!isVisible || isEditing) return null;

  return (
    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex gap-1 bg-white border rounded-lg shadow-lg p-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-blue-50"
          onClick={onEdit}
          title="Edit"
        >
          <Edit className="h-3 w-3" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-red-50"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
        
        <div className="w-px bg-gray-200 mx-1" />
        
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-green-50"
          onClick={onAddSubObjective}
          title="Add Sub-Objective"
        >
          <Plus className="h-3 w-3" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-green-50"
          onClick={onAddKeyResult}
          title="Add Key Result"
        >
          <Plus className="h-3 w-3 text-rose-500" />
        </Button>
        
        <div className="w-px bg-gray-200 mx-1" />
        
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-purple-50"
          onClick={onLink}
          title="Link to Another Node"
        >
          <Link className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default InlineActionMenu;
