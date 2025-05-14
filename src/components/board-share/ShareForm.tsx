
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Check } from 'lucide-react';

// Define permission type as a union of allowed values to match database constraint
export type Permission = 'view' | 'edit';

interface ShareFormProps {
  onShare: (email: string, permission: Permission) => Promise<void>;
  isSubmitting: boolean;
}

const ShareForm: React.FC<ShareFormProps> = ({ onShare, isSubmitting }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('view');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    await onShare(email, permission);
    setEmail('');
    setPermission('view');
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {permission === 'view' ? 'Can view' : 'Can edit'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="end">
          <div className="flex flex-col">
            <button
              className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setPermission('view');
                setIsPopoverOpen(false);
              }}
            >
              Can view
              {permission === 'view' && <Check className="w-4 h-4" />}
            </button>
            <button
              className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setPermission('edit');
                setIsPopoverOpen(false);
              }}
            >
              Can edit
              {permission === 'edit' && <Check className="w-4 h-4" />}
            </button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button 
        onClick={handleSubmit} 
        disabled={!email || isSubmitting}
      >
        Share
      </Button>
    </div>
  );
};

export default ShareForm;
