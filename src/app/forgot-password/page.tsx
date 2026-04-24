'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-24">
      {sent ? (
        <div className="text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-muted-foreground text-sm mb-6">We've sent a reset link to {email}</p>
          <Link href="/login" className="text-primary hover:underline text-sm">Back to Login</Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground text-sm mb-8 text-center">Enter your email and we'll send a reset link</p>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="w-full max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border/50 h-12 rounded-xl" required />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-semibold gradient-primary">Send Reset Link</Button>
            <p className="text-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to Login</Link></p>
          </form>
        </>
      )}
    </div>
  );
}
