
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PlusIconMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubObjective: () => void;
  onAddKeyResult: () => void;
  position: { x: number; y: number };
}

const PlusIconMenu: React.FC<PlusIconMenuProps> = ({
  isOpen,
  onClose,
  onAddSubObjective,
  onAddKeyResult,
  position
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop to close menu when clicking outside */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <Card 
        className="absolute z-50 p-2 shadow-lg border bg-white min-w-32"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs"
            onClick={() => {
              onAddSubObjective();
              onClose();
            }}
          >
            Add Sub-Objective
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs"
            onClick={() => {
              onAddKeyResult();
              onClose();
            }}
          >
            Add Key Result
          </Button>
        </div>
      </Card>
    </>
  );
};

export default PlusIconMenu;
