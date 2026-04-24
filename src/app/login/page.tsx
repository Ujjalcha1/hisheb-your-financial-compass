'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from '@/assets/logo.png';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        setUser({ 
          name: data.user.user_metadata.full_name || 'User', 
          email: data.user.email || '' 
        });
        setAuthenticated(true);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-[#fafafa] dark:bg-[#050505]">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Image src={logo} alt="Hisheb" width={48} height={48} className="brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-medium">Sign in to your financial compass</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 bg-card/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/[0.03]">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Email or Phone</Label>
            <Input
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-border/30 h-14 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-base pl-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" title="Password" className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border/30 h-14 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-base pl-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-destructive text-sm font-semibold ml-1 animate-pulse">{error}</p>}

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl font-bold text-lg gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in…</span>
              </div>
            ) : 'Sign In'}
          </Button>

          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest px-1">
            <Link href="/forgot-password" title="Forgot Password" className="text-primary hover:text-primary/80 transition-colors">Forgot Password?</Link>
            <Link href="/register" title="Create Account" className="text-primary hover:text-primary/80 transition-colors">Create Account</Link>
          </div>
        </form>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
          Secure & Encrypted with Supabase
        </p>
      </div>
    </div>
  );
}
