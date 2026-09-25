import type { ReactNode } from 'react';
import { AdminShell } from '@/features/admin/components/AdminShell';

export const metadata = { title: 'Admin', robots: { index: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
