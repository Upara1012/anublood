import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../services/api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const { user, token } = await apiLogin(email, password);
      login(user, token);
      toast.success(`Welcome back, ${user.name}`);
      if (from) {
        navigate(from, {
          replace: true
        });
      } else {
        navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', {
          replace: true
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || (error.response?.status === 401 ? 'Invalid email or password' : 'Failed to login');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
        <p className="text-gray-500 text-sm mt-1">Access your hospital blood inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          icon={<Mail className="h-4 w-4" />}
          required />
        
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon={<Lock className="h-4 w-4" />}
          required />
        

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}>
          
          Sign in
        </Button>
      </form>
    </div>);

};