import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
// Layouts & Protection
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PageLoader } from './components/ui/LoadingSpinner';
// Pages
import { Login } from './pages/Login';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Inventory } from './pages/Inventory';
import { SearchBlood } from './pages/SearchBlood';
import { Requests } from './pages/Requests';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { UserManagement } from './pages/UserManagement';
import { NotFound } from './pages/NotFound';
import { SocketProvider } from './context/SocketContext';

// Root redirect component
const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
      replace />);


};
export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route
              element={
              <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
              
              {/* Shared Routes */}
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/search" element={<SearchBlood />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />

              {/* Staff Only Route (Admin can access too via shared logic, but specifically for staff landing) */}
              <Route
                path="/dashboard"
                element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } />
              

              {/* Admin Only Routes */}
              <Route
                path="/admin/dashboard"
                element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/admin/users"
                element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                } />
              
            </Route>

            {/* Root & Fallback */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>);

}