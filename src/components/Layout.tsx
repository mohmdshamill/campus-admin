import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, CalendarCheck2, ScrollText, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users & Roles', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { to: '/audit', label: 'Audit Trail', icon: ScrollText },
];

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-64">
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 text-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-sky-400 grid place-items-center shadow-glow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold leading-tight">Campus Connect</p>
              <p className="text-[10px] uppercase tracking-widest text-accent-400">Website Admin</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-accent-600 text-white shadow-glow' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <l.icon className="w-4 h-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs">
          <p className="font-semibold truncate">{user?.name}</p>
          <p className="text-slate-400 truncate mb-3">{user?.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-slate-300 hover:text-white">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <header className="lg:hidden h-14 px-4 flex items-center gap-3 bg-white border-b border-slate-200 sticky top-0 z-20">
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold">Website Admin</span>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-up">
        <Outlet />
      </main>
    </div>
  );
};
