
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Edit, Trash2 } from 'lucide-react';

interface KeyResultNodeHeaderProps {
  isEditing: boolean;
  label: string;
  setLabel: (value: string) => void;
  handleSave: () => void;
  setIsEditing: (value: boolean) => void;
  handleDelete: () => void;
}

const KeyResultNodeHeader: React.FC<KeyResultNodeHeaderProps> = ({
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
        <CardTitle className="text-lg font-medium text-rose-800">
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

export default KeyResultNodeHeader;
