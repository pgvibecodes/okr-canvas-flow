
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface KeyResultNodeContentProps {
  isEditing: boolean;
  description: string;
  setDescription: (value: string) => void;
  progress: number;
  setProgress: (value: number) => void;
}

const KeyResultNodeContent: React.FC<KeyResultNodeContentProps> = ({
  isEditing,
  description,
  setDescription,
  progress,
  setProgress,
}) => {
  return (
    <>
      {isEditing ? (
        <>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
            className="min-h-[60px] text-sm"
          />
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => setProgress(value[0])}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">{description}</p>
          <div className="space-y-1">
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

export default KeyResultNodeContent;
