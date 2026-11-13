import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Layers, CalendarCheck2, Clock, Wrench, Building2, Activity, Database, Cpu } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, SystemStatus } from '../api';
import { PageHeader, Pill, Stat } from '../components/ui';

const COLORS: Record<string, string> = {
  APPROVED: '#10b981',
  PENDING: '#f59e0b',
  REJECTED: '#f43f5e',
  CANCELLED: '#94a3b8',
  COMPLETED: '#0ea5e9',
};

const fmtUptime = (s: number) => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
};

export const OverviewPage: React.FC = () => {
  const dash = useQuery({ queryKey: ['dash'], queryFn: async () => (await api.get('/reports/dashboard/admin')).data.data });
  const sys = useQuery({
    queryKey: ['sys'],
    queryFn: async () => (await api.get('/system/status')).data.data as SystemStatus,
    refetchInterval: 15000,
  });

  const o = dash.data?.overview || {};
  const status: { status: string; count: number }[] = dash.data?.statusBreakdown || [];
  const depts: any[] = dash.data?.departmentUtilization || [];
  const recent: any[] = dash.data?.recentBookings || [];

  return (
    <>
      <PageHeader title="Institution overview" subtitle="Live metrics across every department and facility." />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Departments" value={o.totalDepartments ?? '–'} icon={<Building2 className="w-5 h-5" />} />
        <Stat label="Users" value={o.totalUsers ?? '–'} icon={<Users className="w-5 h-5" />} tone="bg-sky-500/10 text-sky-600" />
        <Stat label="Resources" value={o.totalResources ?? '–'} icon={<Layers className="w-5 h-5" />} tone="bg-emerald-500/10 text-emerald-600" />
        <Stat label="Bookings today" value={o.todayBookingsCount ?? '–'} icon={<CalendarCheck2 className="w-5 h-5" />} tone="bg-indigo-500/10 text-indigo-600" />
        <Stat label="Pending approval" value={o.pendingBookingsCount ?? '–'} icon={<Clock className="w-5 h-5" />} tone="bg-amber-500/10 text-amber-600" />
        <Stat label="Under maintenance" value={o.underMaintenanceCount ?? '–'} icon={<Wrench className="w-5 h-5" />} tone="bg-rose-500/10 text-rose-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold mb-4">Department utilisation</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={depts} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="code" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookingsCount" name="Bookings" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resourcesCount" name="Resources" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-2">Booking status</h2>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={status} dataKey="count" nameKey="status" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {status.map((s) => (
                    <Cell key={s.status} fill={COLORS[s.status] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1 text-sm">
            {status.map((s) => (
              <li key={s.status} className="flex items-center justify-between">
                <Pill value={s.status} />
                <span className="font-semibold tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-600" /> System health
          </h2>
          {sys.isError ? (
            <p className="text-sm text-rose-600">Status unavailable.</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <Row icon={<Database className="w-4 h-4" />} k="DB latency" v={sys.data ? `${sys.data.dbLatencyMs} ms` : '…'} />
              <Row icon={<Clock className="w-4 h-4" />} k="API uptime" v={sys.data ? fmtUptime(sys.data.uptimeSeconds) : '…'} />
              <Row icon={<Cpu className="w-4 h-4" />} k="Memory (RSS)" v={sys.data ? `${sys.data.memoryMb} MB` : '…'} />
              <Row icon={<Activity className="w-4 h-4" />} k="Node" v={sys.data?.nodeVersion ?? '…'} />
            </dl>
          )}
        </div>

        <div className="card lg:col-span-2 overflow-hidden">
          <h2 className="font-bold p-5 pb-3">Recent bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Code</th>
                  <th className="th">Facility</th>
                  <th className="th">Requested by</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((b) => (
                  <tr key={b.id}>
                    <td className="td font-mono text-xs">{b.bookingCode}</td>
                    <td className="td">{b.resource?.name}</td>
                    <td className="td">{b.user?.name}</td>
                    <td className="td">
                      <Pill value={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

const Row: React.FC<{ icon: React.ReactNode; k: string; v: string }> = ({ icon, k, v }) => (
  <div className="flex items-center justify-between">
    <dt className="flex items-center gap-2 text-slate-500">
      {icon} {k}
    </dt>
    <dd className="font-semibold tabular-nums">{v}</dd>
  </div>
);
