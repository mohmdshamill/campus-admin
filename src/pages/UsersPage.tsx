import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api, errMsg, Role, User } from '../api';
import { Empty, PageHeader, Pager, Pill, useDebounced } from '../components/ui';
import { useAuth } from '../auth';

export const UsersPage: React.FC = () => {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);

  const list = useQuery({
    queryKey: ['users', q, role, page],
    queryFn: async () => {
      const r = await api.get('/users', { params: { search: q || undefined, role: role || undefined, page, limit: 12 } });
      return { users: r.data.data as User[], totalPages: (r.data.meta?.totalPages as number) || 1 };
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => api.patch(`/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => alert(errMsg(e)),
  });

  const users = list.data?.users || [];

  return (
    <>
      <PageHeader title="Users & roles" subtitle="Promote coordinators, disable accounts and audit who has access." />
      <div className="card overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search name, email or college ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="input sm:w-48"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="SUPER_ADMIN">Super admin</option>
            <option value="WEBSITE_ADMIN">Website admin</option>
            <option value="COORDINATOR">Coordinator</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>

        {list.isLoading ? (
          <Empty text="Loading users…" />
        ) : users.length === 0 ? (
          <Empty text="No users match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">User</th>
                  <th className="th">Department</th>
                  <th className="th">Role</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const self = u.id === me?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="td">
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="td">{u.department?.code ?? '—'}</td>
                      <td className="td">
                        <select
                          aria-label={`Role for ${u.name}`}
                          className="input py-1.5 w-40"
                          value={u.role}
                          disabled={self}
                          onChange={(e) => update.mutate({ id: u.id, data: { role: e.target.value as Role } })}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="COORDINATOR">Coordinator</option>
                          <option value="SUPER_ADMIN">Super admin</option>
            <option value="WEBSITE_ADMIN">Website admin</option>
                        </select>
                      </td>
                      <td className="td">
                        <Pill value={u.isActive ? 'ACTIVE' : 'DISABLED'} />
                      </td>
                      <td className="td text-right">
                        <button
                          className="btn-ghost py-1.5"
                          disabled={self}
                          title={self ? 'You cannot disable your own account' : undefined}
                          onClick={() => update.mutate({ id: u.id, data: { isActive: !u.isActive } })}
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} totalPages={list.data?.totalPages || 1} onChange={setPage} />
      </div>
    </>
  );
};
