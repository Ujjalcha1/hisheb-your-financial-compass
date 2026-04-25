'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { supabase } from '@/lib/supabase';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const timer = setTimeout(() => {
        if (session) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }, 2500);
      
      return () => clearTimeout(timer);
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="animate-pulse-glow rounded-3xl p-2">
        <Image src={logo} alt="Hisheb" width={96} height={96} className="rounded-2xl" />
      </div>
      <div className="text-center animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Hisheb</h1>
        <p className="text-muted-foreground mt-2 text-sm">Track your daily expenses easily</p>
      </div>
      <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
