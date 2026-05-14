import React from 'react';
import { Outlet } from 'react-router-dom';
import { Droplet } from 'lucide-react';
export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-red-600 transform -skew-y-6 origin-top-left -translate-y-24 z-0 opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/3 translate-y-1/3"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2 text-red-600 mb-6">
          <Droplet className="h-10 w-10 fill-current" />
          <span className="text-3xl font-bold tracking-tight text-gray-900">
            AnuBlood
          </span>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Blood Inventory & Locator System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>);

};