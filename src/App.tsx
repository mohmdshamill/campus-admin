import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { UsersPage } from './pages/UsersPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { BookingsPage } from './pages/BookingsPage';
import { AuditPage } from './pages/AuditPage';

const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-slate-500">Loading…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      element={
        <Guard>
          <Layout />
        </Guard>
      }
    >
      <Route index element={<OverviewPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="departments" element={<DepartmentsPage />} />
      <Route path="bookings" element={<BookingsPage />} />
      <Route path="audit" element={<AuditPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
