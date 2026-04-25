import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your financial overview, recent activity, and quick actions.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
