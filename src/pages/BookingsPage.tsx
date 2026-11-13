import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { api, Booking, downloadBlob, errMsg } from '../api';
import { Empty, PageHeader, Pager, Pill } from '../components/ui';

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

export const BookingsPage: React.FC = () => {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ['bookings', status, page],
    queryFn: async () => {
      const r = await api.get('/bookings', { params: { status: status || undefined, page, limit: 12 } });
      return { rows: r.data.data as Booking[], totalPages: (r.data.meta?.totalPages as number) || 1 };
    },
  });

  const act = useMutation({
    mutationFn: async ({ id, kind }: { id: string; kind: 'approve' | 'reject' }) => {
      if (kind === 'approve') return api.patch(`/bookings/${id}/approve`, {});
      const reason = window.prompt('Reason for rejection (min. 3 characters)');
      if (!reason || reason.trim().length < 3) throw new Error('A rejection reason is required.');
      return api.patch(`/bookings/${id}/reject`, { reason: reason.trim() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    onError: (e) => alert(errMsg(e)),
  });

  const exportCsv = async () => {
    try {
      const r = await api.get('/reports/export/bookings', { responseType: 'blob' });
      downloadBlob(r.data, `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const rows = list.data?.rows || [];

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Institution-wide reservations with one-click approval."
        actions={
          <button className="btn-ghost" onClick={exportCsv}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />
      <div className="card overflow-hidden">
        <div className="p-3 flex flex-wrap gap-1.5 border-b border-slate-100">
          {STATUSES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                status === s ? 'bg-accent-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        {list.isLoading ? (
          <Empty text="Loading bookings…" />
        ) : rows.length === 0 ? (
          <Empty text="No bookings in this view." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Code</th>
                  <th className="th">Facility</th>
                  <th className="th">Requested by</th>
                  <th className="th">When</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="td font-mono text-xs">{b.bookingCode}</td>
                    <td className="td">
                      <p className="font-semibold">{b.resource?.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[16rem]">{b.purpose}</p>
                    </td>
                    <td className="td">{b.user?.name}</td>
                    <td className="td whitespace-nowrap">
                      {format(new Date(b.startDateTime), 'dd MMM, HH:mm')} – {format(new Date(b.endDateTime), 'HH:mm')}
                    </td>
                    <td className="td">
                      <Pill value={b.status} />
                    </td>
                    <td className="td text-right whitespace-nowrap">
                      {b.status === 'PENDING' && (
                        <span className="text-xs text-slate-400">Awaiting Super Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} totalPages={list.data?.totalPages || 1} onChange={setPage} />
      </div>
    </>
  );
};
