
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showBoard?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading your OKR data...', 
  size = 'lg',
  showBoard = false
}) => {
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={`${sizeMap[size]} animate-spin text-blue-600`} />
        <p className={size === 'lg' ? 'text-lg' : 'text-base'}>{message}</p>
        
        {showBoard && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
            Loading board data. If this takes too long, try selecting a different board or creating a new one.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingIndicator;
