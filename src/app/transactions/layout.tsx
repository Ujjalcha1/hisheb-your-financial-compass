import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Search and manage all your financial transactions.',
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
