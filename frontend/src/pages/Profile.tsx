import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { UserCircle, Building2, Shield } from 'lucide-react';
import { toast } from 'sonner';
export const Profile = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully');
    }, 800);
  };
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPwd(true);
    setTimeout(() => {
      setIsChangingPwd(false);
      toast.success('Password changed successfully');
      (e.target as HTMLFormElement).reset();
    }, 800);
  };
  if (!user) return null;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">
          Manage your account details and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center">
            <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
              <UserCircle size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{user.email}</p>
            <Badge
              variant={user.role === 'ADMIN' ? 'danger' : 'info'}
              className="mb-2">
              
              {user.role}
            </Badge>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
              <Building2 size={16} />
              {user.hospitalName}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" defaultValue={user.name} />
                <Input
                  label="Email Address"
                  type="email"
                  defaultValue={user.email}
                  disabled />
                
                <Input
                  label="Hospital/Organization"
                  defaultValue={user.hospitalName}
                  disabled />
                
                <Input label="Role" defaultValue={user.role} disabled />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              Security
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input label="Current Password" type="password" required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="New Password" type="password" required />
                <Input label="Confirm New Password" type="password" required />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={isChangingPwd}>
                  
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>);

};