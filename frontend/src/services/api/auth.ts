import api from './axios';
import { User } from '../../types';

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/login', { email, password });
  const { data, success, message } = response.data;
  
  if (!success) {
    throw new Error(message || 'Login failed');
  }

  return { 
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      hospitalName: data.hospitalName,
      avatar: data.avatar
    }, 
    token: data.token 
  };
};

export const verifyToken = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  const { data, success } = response.data;
  
  if (!success) {
    throw new Error('Token verification failed');
  }

  return {
    id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    hospitalName: data.hospitalName,
    avatar: data.avatar
  };
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.put('/auth/change-password', { currentPassword, newPassword });
};