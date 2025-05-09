
import React from 'react';
import OKRBoard from '../components/OKRBoard';
import { Toaster } from 'sonner';

const Index = () => {
  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      <OKRBoard />
    </div>
  );
};

export default Index;
