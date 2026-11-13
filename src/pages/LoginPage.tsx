import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../auth';
import { errMsg } from '../api';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@campusconnect.edu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-ink-950 via-ink-900 to-accent-700/40">
      <form onSubmit={submit} className="w-full max-w-sm card p-8 space-y-5 animate-up">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-sky-400 grid place-items-center text-white shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold">Website Admin</h1>
          <p className="text-sm text-slate-500">Restricted to Campus Connect website admins.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" required className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="password">
            Password
          </label>
          <input id="password" type="password" required className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <button className="btn-primary w-full" disabled={busy}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
        </button>
      </form>
    </div>
  );
};
