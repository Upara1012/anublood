import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { getMonthlyTrends, getExpiryStats, getDashboardStats } from '../services/api/reports';
import { PageLoader } from '../components/ui/LoadingSpinner';

export const Reports = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [demandData, setDemandData] = useState<any[]>([]);
  const [expiryTrend, setExpiryTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsData, expData, dashData] = await Promise.all([
          getMonthlyTrends(),
          getExpiryStats(),
          getDashboardStats(),
        ]);

        // Map backend trends to chart data
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        setTrends(
          trendsData.map((t: any) => ({
            month: monthNames[t._id.month - 1],
            units: t.units,
          }))
        );

        // Map blood type summary to demandData
        setDemandData(
          dashData.bloodTypeSummary?.map((item: any) => ({
            type: item._id,
            demand: item.total,
          })) || []
        );

        // Mocking the Saved/Expired split for now as backend doesn't provide history yet
        setExpiryTrend([
          { week: 'W1', expired: expData.totalExpired / 4, saved: 45 },
          { week: 'W2', expired: expData.totalExpired / 4, saved: 55 },
          { week: 'W3', expired: expData.totalExpired / 4, saved: 35 },
          { week: 'W4', expired: expData.totalExpired / 4, saved: 60 },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      // Fetch full inventory for detailed report
      const { getInventory } = await import('../services/api/inventory');
      const inventory = await getInventory();
      
      const headers = ['Blood Type', 'Units', 'Hospital Name', 'Collection Date', 'Expiry Date', 'Status'];
      const rows = inventory.map(item => [
        item.bloodType,
        item.units,
        item.hospitalName,
        new Date(item.collectionDate).toLocaleDateString(),
        new Date(item.expiryDate).toLocaleDateString(),
        item.status
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `AnuBlood_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Detailed report exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export report');
    }
  };

  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="text-gray-500">
            View system usage and generate reports.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Calendar size={18} />}>
            Last 6 Months
          </Button>
          <Button leftIcon={<Download size={18} />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Collection vs Usage Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trends}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="units"
                  name="Units Processed"
                  stroke="#DC2626"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Demand by Blood Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={demandData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E5E7EB" />
                
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280'
                  }} />
                
                <YAxis
                  dataKey="type"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#374151',
                    fontWeight: 500
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
                
                <Bar
                  dataKey="demand"
                  name="Requests"
                  fill="#DC2626"
                  radius={[0, 4, 4, 0]}
                  barSize={20} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Expiry Management (This Month)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={expiryTrend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB" />
                
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280'
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280'
                  }} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Legend />
                <Area
                  type="monotone"
                  dataKey="saved"
                  name="Units Used Before Expiry"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#93C5FD" />
                
                <Area
                  type="monotone"
                  dataKey="expired"
                  name="Units Expired"
                  stackId="1"
                  stroke="#F43F5E"
                  fill="#FDA4AF" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>);

};