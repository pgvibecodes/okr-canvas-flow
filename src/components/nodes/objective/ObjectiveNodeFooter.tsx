
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ObjectiveNodeFooterProps {
  addSubObjective: () => void;
  addKeyResult: () => void;
}

const ObjectiveNodeFooter: React.FC<ObjectiveNodeFooterProps> = ({
  addSubObjective,
  addKeyResult,
}) => {
  return (
    <div className="p-3 pt-0 flex justify-between">
      <Button 
        onClick={addSubObjective}
        size="sm" 
        variant="outline"
        className="text-xs flex items-center gap-1"
      >
        <Plus className="h-3 w-3" /> Sub-Objective
      </Button>
      <Button 
        onClick={addKeyResult}
        size="sm" 
        variant="outline"
        className="text-xs flex items-center gap-1"
      >
        <Plus className="h-3 w-3" /> Key Result
      </Button>
    </div>
  );
};

export default ObjectiveNodeFooter;
