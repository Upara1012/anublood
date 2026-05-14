import api from './axios';
import { User } from '../../types';

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data.data.map((user: any) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    hospitalName: user.hospitalName,
    avatar: user.avatar,
    phone: user.phone,
    lat: user.lat,
    lng: user.lng,
    address: user.address,
    status: user.status
  }));
};

export const addUser = async (user: Omit<User, 'id'> & { password?: string }): Promise<User> => {
  const response = await api.post('/users', user);
  const data = response.data.data;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    hospitalName: data.hospitalName,
    avatar: data.avatar,
    phone: data.phone,
    lat: data.lat,
    lng: data.lng,
    address: data.address
  };
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User> => {
  const response = await api.put(`/users/${id}`, updates);
  const data = response.data.data;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    hospitalName: data.hospitalName,
    status: data.status,
    phone: data.phone,
    lat: data.lat,
    lng: data.lng,
    address: data.address
  };
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};