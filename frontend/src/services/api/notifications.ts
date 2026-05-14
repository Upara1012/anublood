import api from './axios';
import { Notification } from '../../types';

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data.data.map((note: any) => ({
    id: note._id,
    userId: note.user,
    title: note.title,
    message: note.message,
    type: note.type,
    read: note.readStatus,
    date: note.createdAt
  }));
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
