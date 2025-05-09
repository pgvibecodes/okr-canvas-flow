
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionBarProps {
  onAddObjective: (position: { x: number, y: number }) => void;
}

const FloatingActionBar = ({ onAddObjective }: FloatingActionBarProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-full shadow-lg p-1 flex items-center">
        <Button
          onClick={() => onAddObjective({ x: 100, y: 100 })}
          className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Objective
        </Button>
      </div>
    </div>
  );
};

export default FloatingActionBar;
