import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Droplet, AlertTriangle, Clock, Send, ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { getInventory } from '../services/api/inventory';
import { getRequests } from '../services/api/requests';
import { BloodStock } from '../types';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

import { useSocket } from '../context/SocketContext';

export const StaffDashboard = () => {
  const { socket } = useSocket();
  const [inventory, setInventory] = useState<BloodStock[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [invData, reqData] = await Promise.all([
        getInventory(),
        getRequests(),
      ]);
      setInventory(invData);
      setRequests(reqData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('notification', () => {
        fetchData();
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);
  if (isLoading) return <PageLoader />;
  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
  const lowStockItems = inventory.filter((i) => i.status === 'LOW').length;
  const expiringItems = inventory.filter((i) => i.status === 'EXPIRING').length;
  const chartData = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
    (type) => ({
      name: type,
      units: inventory.
      filter((i) => i.bloodType === type).
      reduce((sum, i) => sum + i.units, 0)
    })
  );
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  const stats = [
    {
      title: 'Total Units',
      value: totalUnits,
      icon: Droplet,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      title: 'Expiring Soon',
      value: expiringItems,
      icon: Clock,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
    {
      title: 'Pending Requests',
      value: pendingRequestsCount,
      icon: Send,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back. Here's what's happening with your inventory today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) =>
        <Card key={i} className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Blood Stock by Type
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                    fontSize: 12
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                    fontSize: 12
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: '#F3F4F6'
                  }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Bar dataKey="units" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Alerts
            </h3>
            <Link
              to="/notifications"
              className="text-sm text-red-600 hover:text-red-700 font-medium">
              
              View all
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            {inventory.
            filter((i) => i.status !== 'AVAILABLE').
            slice(0, 4).
            map((item) =>
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              
                  <div
                className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${item.status === 'EXPIRING' ? 'bg-rose-500' : 'bg-amber-500'}`} />
              
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.bloodType} -{' '}
                      {item.status === 'EXPIRING' ?
                  'Expiring Soon' :
                  'Low Stock'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.units} units remaining
                    </p>
                  </div>
                </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
        {
          title: 'Add New Stock',
          desc: 'Register new blood units',
          path: '/inventory'
        },
        {
          title: 'Find Blood',
          desc: 'Search nearby hospitals',
          path: '/search'
        },
        {
          title: 'View Requests',
          desc: 'Manage incoming requests',
          path: '/requests'
        },
        {
          title: 'Generate Report',
          desc: 'Download monthly stats',
          path: '/reports'
        }].
        map((action, i) =>
        <Link key={i} to={action.path}>
            <Card className="hover:border-red-200 hover:shadow-md transition-all cursor-pointer group h-full">
              <h4 className="font-medium text-gray-900 group-hover:text-red-600 flex items-center justify-between">
                {action.title}
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
            </Card>
          </Link>
        )}
      </div>
    </div>);

};