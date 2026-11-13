import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api, AuditLog } from '../api';
import { Empty, PageHeader, Pager, useDebounced } from '../components/ui';

export const AuditPage: React.FC = () => {
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const a = useDebounced(action);
  const e = useDebounced(entityType);

  const list = useQuery({
    queryKey: ['audit', a, e, page],
    queryFn: async () => {
      const r = await api.get('/audit-logs', { params: { action: a || undefined, entityType: e || undefined, page, limit: 20 } });
      return { rows: r.data.data as AuditLog[], totalPages: (r.data.meta?.totalPages as number) || 1 };
    },
  });
  const rows = list.data?.rows || [];

  return (
    <>
      <PageHeader title="Audit trail" subtitle="Every sensitive action, who did it, and from where." />
      <div className="card overflow-hidden">
        <div className="p-4 grid sm:grid-cols-2 gap-3 border-b border-slate-100">
          <input
            className="input"
            placeholder="Filter by action (e.g. BOOKING_APPROVED)"
            value={action}
            onChange={(ev) => {
              setAction(ev.target.value);
              setPage(1);
            }}
          />
          <input
            className="input"
            placeholder="Filter by entity (e.g. Booking)"
            value={entityType}
            onChange={(ev) => {
              setEntityType(ev.target.value);
              setPage(1);
            }}
          />
        </div>
        {list.isLoading ? (
          <Empty text="Loading audit entries…" />
        ) : rows.length === 0 ? (
          <Empty text="No audit entries found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Time</th>
                  <th className="th">Actor</th>
                  <th className="th">Action</th>
                  <th className="th">Entity</th>
                  <th className="th">Details</th>
                  <th className="th">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="td whitespace-nowrap text-slate-500">{format(new Date(r.createdAt), 'dd MMM yyyy, HH:mm:ss')}</td>
                    <td className="td">{r.userEmail ?? 'system'}</td>
                    <td className="td font-mono text-xs font-semibold text-accent-700">{r.action}</td>
                    <td className="td">{r.entityType}</td>
                    <td className="td max-w-xs truncate text-slate-500" title={r.details ?? ''}>
                      {r.details ?? '—'}
                    </td>
                    <td className="td text-slate-500">{r.ipAddress ?? '—'}</td>
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
