
import React from 'react';
import { Edit, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardTitle } from '@/components/ui/card';

interface ObjectiveNodeHeaderProps {
  isEditing: boolean;
  label: string;
  setLabel: (label: string) => void;
  handleSave: () => void;
  setIsEditing: (isEditing: boolean) => void;
  handleDelete: () => void;
}

const ObjectiveNodeHeader: React.FC<ObjectiveNodeHeaderProps> = ({
  isEditing,
  label,
  setLabel,
  handleSave,
  setIsEditing,
  handleDelete,
}) => {
  return (
    <div className="flex justify-between items-center">
      {isEditing ? (
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="font-medium"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
          }}
        />
      ) : (
        <CardTitle className="text-lg font-medium text-blue-800">
          {label}
        </CardTitle>
      )}
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className="h-8 w-8"
        >
          {isEditing ? (
            <Check className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ObjectiveNodeHeader;
