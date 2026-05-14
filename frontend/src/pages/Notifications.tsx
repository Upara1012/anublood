import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertTriangle, Info, Clock, Check } from 'lucide-react';
import { getNotifications, markAsRead as apiMarkRead } from '../services/api/notifications';
import { Notification } from '../types';
import { PageLoader } from '../components/ui/LoadingSpinner';

import { toast } from 'sonner';
import { useSocket } from '../context/SocketContext';

export const Notifications = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      socket.on('notification', (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => apiMarkRead(n.id)));
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiMarkRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  if (isLoading) return <PageLoader />;
  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      case 'WARNING':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };
  const getBg = (type: string) => {
    switch (type) {
      case 'ALERT':
        return 'bg-rose-100';
      case 'WARNING':
        return 'bg-amber-100';
      default:
        return 'bg-blue-100';
    }
  };
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 &&
            <Badge variant="danger">{unreadCount} new</Badge>
            }
          </h1>
        </div>
        <Button
          variant="secondary"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          leftIcon={<Check size={16} />}>
          
          Mark all as read
        </Button>
      </div>

      <Card noPadding className="divide-y divide-gray-100">
        {notifications.length === 0 ?
        <div className="p-12 text-center text-gray-500">No notifications</div> :

        notifications.map((notification) =>
        <div
          key={notification.id}
          className={`p-4 sm:p-6 flex gap-4 transition-colors ${notification.read ? 'bg-white' : 'bg-red-50/30'}`}
          onClick={() =>
          !notification.read && handleMarkRead(notification.id)
          }>
          
              <div
            className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getBg(notification.type)}`}>
            
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4
                className={`text-sm font-semibold ${notification.read ? 'text-gray-900' : 'text-red-900'}`}>
                
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(notification.date).toLocaleDateString()}
                  </span>
                </div>
                <p
              className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
              
                  {notification.message}
                </p>
              </div>
              {!notification.read &&
          <div className="shrink-0 flex items-center">
                  <div className="h-2.5 w-2.5 bg-red-600 rounded-full"></div>
                </div>
          }
            </div>
        )
        }
      </Card>
    </div>);

};