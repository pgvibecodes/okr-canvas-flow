
import React from 'react';
import { Plus, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodeActionIconsProps {
  onPlusClick: () => void;
  onLinkClick: () => void;
  isVisible: boolean;
}

const NodeActionIcons: React.FC<NodeActionIconsProps> = ({
  onPlusClick,
  onLinkClick,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Left side icons */}
      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
        <Button
          size="sm"
          variant="outline"
          className="w-6 h-6 p-0 bg-white shadow-md hover:bg-blue-50"
          onClick={onPlusClick}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-6 h-6 p-0 bg-white shadow-md hover:bg-blue-50"
          onClick={onLinkClick}
        >
          <Link className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Right side icons */}
      <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
        <Button
          size="sm"
          variant="outline"
          className="w-6 h-6 p-0 bg-white shadow-md hover:bg-blue-50"
          onClick={onPlusClick}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-6 h-6 p-0 bg-white shadow-md hover:bg-blue-50"
          onClick={onLinkClick}
        >
          <Link className="h-3 w-3" />
        </Button>
      </div>
    </>
  );
};

export default NodeActionIcons;
