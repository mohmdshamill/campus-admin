import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Layers, Package, Users } from 'lucide-react';
import { api, Department, errMsg } from '../api';
import { Empty, PageHeader, Pill } from '../components/ui';

export const DepartmentsPage: React.FC = () => {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const list = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data.data as Department[],
  });

  const create = useMutation({
    mutationFn: () => api.post('/departments', { name, code: code.toUpperCase(), description: description || undefined }),
    onSuccess: () => {
      setName('');
      setCode('');
      setDescription('');
      setError('');
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (e) => setError(errMsg(e)),
  });

  const toggle = useMutation({
    mutationFn: (d: Department) => api.patch(`/departments/${d.id}`, { isActive: !d.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
    onError: (e) => alert(errMsg(e)),
  });

  const depts = list.data || [];

  return (
    <>
      <PageHeader title="Departments" subtitle="Academic units that own facilities, equipment and coordinators." />

      <form
        className="card p-4 mb-6 grid sm:grid-cols-[1fr_8rem_1.5fr_auto] gap-3 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="dn">
            Name
          </label>
          <input id="dn" className="input mt-1" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mechanical Engineering" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="dc">
            Code
          </label>
          <input id="dc" className="input mt-1 uppercase" required minLength={2} maxLength={10} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ME" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="dd">
            Description
          </label>
          <input id="dd" className="input mt-1" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
        </div>
        <button className="btn-primary" disabled={create.isPending}>
          <Plus className="w-4 h-4" /> Add
        </button>
        {error && (
          <p role="alert" className="sm:col-span-4 text-sm text-rose-600">
            {error}
          </p>
        )}
      </form>

      {list.isLoading ? (
        <Empty text="Loading departments…" />
      ) : depts.length === 0 ? (
        <Empty text="No departments yet." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {depts.map((d) => (
            <div key={d.id} className="card p-5 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-widest text-accent-600">{d.code}</p>
                  <h3 className="font-bold text-lg leading-snug">{d.name}</h3>
                </div>
                <Pill value={d.isActive ? 'ACTIVE' : 'DISABLED'} />
              </div>
              {d.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{d.description}</p>}
              <div className="flex gap-4 mt-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> {d._count?.resources ?? 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> {d._count?.equipment ?? 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {d._count?.users ?? 0}
                </span>
              </div>
              <button className="btn-ghost w-full mt-4" onClick={() => toggle.mutate(d)}>
                {d.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
