
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface ObjectiveNodeContentProps {
  isEditing: boolean;
  description: string;
  setDescription: (description: string) => void;
  progress: number;
}

const ObjectiveNodeContent: React.FC<ObjectiveNodeContentProps> = ({
  isEditing,
  description,
  setDescription,
  progress,
}) => {
  return (
    <>
      {isEditing ? (
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description..."
          className="min-h-[60px] text-sm"
        />
      ) : (
        <>
          <p className="text-sm text-gray-600">{description}</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </>
      )}
    </>
  );
};

export default ObjectiveNodeContent;
