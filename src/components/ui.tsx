import React from 'react';

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode; tone?: string }> = ({
  label,
  value,
  icon,
  tone = 'bg-accent-500/10 text-accent-600',
}) => (
  <div className="card p-5 flex items-center justify-between hover:-translate-y-0.5 transition-transform">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-3xl font-extrabold tabular-nums mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-2xl ${tone}`}>{icon}</div>
  </div>
);

const tones: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
  COMPLETED: 'bg-sky-50 text-sky-700 border-sky-200',
  SUPER_ADMIN: 'bg-amber-50 text-amber-800 border-amber-200',
  WEBSITE_ADMIN: 'bg-violet-50 text-violet-700 border-violet-200',
  COORDINATOR: 'bg-sky-50 text-sky-700 border-sky-200',
  STUDENT: 'bg-slate-100 text-slate-700 border-slate-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DISABLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const Pill: React.FC<{ value: string }> = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
      tones[value] || tones.STUDENT
    }`}
  >
    {value.replace(/_/g, ' ')}
  </span>
);

export const Empty: React.FC<{ text: string }> = ({ text }) => <div className="p-10 text-center text-sm text-slate-500">{text}</div>;

export const Pager: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void }> = ({ page, totalPages, onChange }) =>
  totalPages <= 1 ? null : (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
      <span className="text-slate-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button className="btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Prev
        </button>
        <button className="btn-ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );

export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
