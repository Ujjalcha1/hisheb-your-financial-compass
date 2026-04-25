import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new Hisheb account and start tracking your expenses.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
