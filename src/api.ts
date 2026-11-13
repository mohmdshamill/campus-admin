import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Separate storage key so the admin console never clashes with the student app session.
const TOKEN_KEY = 'cc_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export type Role = 'SUPER_ADMIN' | 'WEBSITE_ADMIN' | 'COORDINATOR' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  collegeId?: string | null;
  isActive: boolean;
  createdAt: string;
  department?: { id: string; name: string; code: string } | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  _count?: { resources: number; equipment: number; users: number };
}

export interface Booking {
  id: string;
  bookingCode: string;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  resource?: { name: string };
  user?: { name: string; email: string };
}

export interface AuditLog {
  id: string;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface SystemStatus {
  uptimeSeconds: number;
  memoryMb: number;
  nodeVersion: string;
  dbLatencyMs: number;
  counts: { users: number; resources: number; bookings: number; pendingBookings: number; openMaintenance: number };
}

export const errMsg = (e: any): string => e?.response?.data?.message || e?.message || 'Something went wrong';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
