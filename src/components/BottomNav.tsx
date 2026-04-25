'use client';

import { Home, List, Users, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/transactions', icon: List, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50 glass border border-border/40 rounded-[2rem] shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                  'flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all duration-300 relative',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
            >
              <Icon className={cn("w-6 h-6 transition-all duration-300", isActive && "scale-110")} />
              <span className={cn("text-[9px] font-bold uppercase tracking-widest transition-all duration-300", isActive ? "opacity-100" : "opacity-0 h-0 scale-0")}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-in zoom-in duration-300" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
