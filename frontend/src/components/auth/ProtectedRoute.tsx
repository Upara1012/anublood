import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { PageLoader } from '../ui/LoadingSpinner';
import { toast } from 'sonner';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}
export const ProtectedRoute = ({
  children,
  allowedRoles
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return <PageLoader />;
  }
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace />);


  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('Unauthorized access. Redirecting to dashboard.');
    return (
      <Navigate
        to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
        replace />);


  }
  return <>{children}</>;
};