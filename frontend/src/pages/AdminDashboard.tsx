import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Users, Building2, Activity, ShieldAlert } from 'lucide-react';
import { getDashboardStats, getExpiryStats } from '../services/api/reports';
import { getUsers } from '../services/api/users';
import { User } from '../types';
import { PageLoader } from '../components/ui/LoadingSpinner';

export const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [expiryStats, setExpiryStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, dashData, expData] = await Promise.all([
          getUsers(),
          getDashboardStats(),
          getExpiryStats(),
        ]);
        setUsers(usersData);
        setDashboardData(dashData);
        setExpiryStats(expData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <PageLoader />;

  const totalStaff = users.filter((u) => u.role === 'STAFF').length;
  const uniqueHospitals = new Set(users.map((u) => u.hospitalName)).size;

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
    {
      title: 'Staff Members',
      value: totalStaff,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Hospitals Network',
      value: uniqueHospitals,
      icon: Building2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Total Blood Units',
      value: dashboardData?.totalUnits || 0,
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
  ];

  const availabilityData = dashboardData?.bloodTypeSummary?.map((item: any) => ({
    type: item._id,
    units: item.total,
    status: item.total > 20 ? 'Good' : item.total > 5 ? 'Moderate' : 'Critical',
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">
          System-wide metrics and administrative controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System-wide Availability
          </h3>
          <div className="flex-1 overflow-hidden">
            <Table
              data={availabilityData}
              keyExtractor={(item) => item.type}
              columns={[
                {
                  header: 'Blood Type',
                  accessorKey: 'type',
                  className: 'font-semibold',
                },
                {
                  header: 'Total Units',
                  accessorKey: 'units',
                },
                {
                  header: 'Status',
                  cell: (item: any) => (
                    <Badge
                      variant={
                        item.status === 'Good'
                          ? 'success'
                          : item.status === 'Moderate'
                          ? 'warning'
                          : 'danger'
                      }>
                      {item.status}
                    </Badge>
                  ),
                },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              Inventory Status
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                <h4 className="text-sm font-semibold text-rose-900">
                  Expired Units
                </h4>
                <p className="text-2xl font-bold text-rose-700 mt-1">
                  {expiryStats?.totalExpired || 0}
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-900">
                  Expiring Soon (7 days)
                </h4>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {expiryStats?.expiringSoon || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Request Activity
            </h3>
            <div className="space-y-4">
              {dashboardData?.recentActivity?.map((log: any) => (
                <div key={log._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-medium text-gray-600">
                    {log.requestedBy?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {log.requestedBy?.hospitalName}
                      </span>{' '}
                      requested {log.unitsRequired} units
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {log.bloodType} | Status: {log.status}
                    </p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.recentActivity ||
                dashboardData.recentActivity.length === 0) && (
                <p className="text-sm text-gray-500 italic">
                  No recent activity
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};