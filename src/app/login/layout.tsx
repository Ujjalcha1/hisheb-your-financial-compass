import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to Hisheb to manage your finances.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
