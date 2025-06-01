
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Minus } from 'lucide-react';

interface ConnectionDirectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNodeLabel: string;
  targetNodeLabel: string;
  onSelectDirection: (direction: 'source-to-target' | 'target-to-source' | 'no-flow') => void;
}

const ConnectionDirectionDialog: React.FC<ConnectionDirectionDialogProps> = ({
  isOpen,
  onClose,
  sourceNodeLabel,
  targetNodeLabel,
  onSelectDirection
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Connection Direction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            How should results flow between these objectives?
          </p>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelectDirection('source-to-target')}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {sourceNodeLabel} → {targetNodeLabel}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelectDirection('target-to-source')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {targetNodeLabel} → {sourceNodeLabel}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelectDirection('no-flow')}
            >
              <Minus className="h-4 w-4 mr-2" />
              No Results Flow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDirectionDialog;
