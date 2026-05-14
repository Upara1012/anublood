import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplet,
  Search,
  Send,
  BarChart3,
  Bell,
  UserCircle,
  Users,
  X } from
'lucide-react';
import { useAuth } from '../../hooks/useAuth';
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = [
  {
    name: 'Dashboard',
    path: isAdmin ? '/admin/dashboard' : '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Inventory',
    path: '/inventory',
    icon: Droplet
  },
  {
    name: 'Search Blood',
    path: '/search',
    icon: Search
  },
  {
    name: 'Requests',
    path: '/requests',
    icon: Send
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: BarChart3
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: Bell
  },
  ...(isAdmin ?
  [
  {
    name: 'User Management',
    path: '/admin/users',
    icon: Users
  }] :

  []),
  {
    name: 'Profile',
    path: '/profile',
    icon: UserCircle
  }];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen &&
      <div
        className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden backdrop-blur-sm"
        onClick={() => setIsOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 shadow-sm
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-red-600">
            <Droplet className="h-6 w-6 fill-current" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              AnuBlood
            </span>
          </div>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}>
            
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          {navItems.map((item) =>
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}>
            
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>);

};