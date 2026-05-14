import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertCircle, Home } from 'lucide-react';
export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
        <AlertCircle size={40} />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. Please
        check the URL or navigate back home.
      </p>
      <Link to="/dashboard">
        <Button leftIcon={<Home size={18} />}>Back to Dashboard</Button>
      </Link>
    </div>);

};