
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading your OKR data...', 
  size = 'lg'
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
      </div>
    </div>
  );
};

export default LoadingIndicator;
