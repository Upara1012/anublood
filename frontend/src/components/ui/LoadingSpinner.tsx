import React from 'react';
import { Loader2 } from 'lucide-react';
export const LoadingSpinner = ({
  className = '',
  size = 24



}: {className?: string;size?: number;}) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className="animate-spin text-red-600" size={size} />
    </div>);

};
export const PageLoader = () =>
<div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner size={32} />
  </div>;