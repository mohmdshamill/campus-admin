import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken, User } from './api';

interface Ctx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api
      .get('/auth/me')
      .then((r) => {
        // The console is for website admins only; any other role is signed out.
        if (r.data.data.role === 'WEBSITE_ADMIN') setUser(r.data.data);
        else setToken(null);
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password });
    const { user: u, token } = r.data.data;
    if (u.role !== 'WEBSITE_ADMIN') throw new Error('This console is restricted to Website Admin accounts.');
    setToken(token);
    setUser(u);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => undefined);
    setToken(null);
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth outside provider');
  return c;
};
