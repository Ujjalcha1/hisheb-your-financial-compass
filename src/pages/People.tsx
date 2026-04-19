import { useState } from 'react';
import { useStore } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function People() {
  const transactions = useStore((s) => s.transactions);
  const [expanded, setExpanded] = useState<string | null>(null);

  const people = transactions
    .filter((t) => t.person)
    .reduce<Record<string, { lent: number; borrowed: number; txns: typeof transactions }>>((acc, t) => {
      const p = t.person!;
      if (!acc[p]) acc[p] = { lent: 0, borrowed: 0, txns: [] };
      if (t.type === 'lend') acc[p].lent += t.amount;
      if (t.type === 'borrow') acc[p].borrowed += t.amount;
      acc[p].txns.push(t);
      return acc;
    }, {});

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold mb-4">People</h1>
      </div>

      <div className="px-5 space-y-3">
        {Object.entries(people).map(([name, { lent, borrowed, txns }]) => {
          const net = lent - borrowed;
          const isExpanded = expanded === name;
          return (
            <div key={name} className="glass-card">
              <button onClick={() => setExpanded(isExpanded ? null : name)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">{name[0]}</div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{name}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {lent > 0 && <span className="text-lend">To receive: ₹{lent}</span>}
                      {borrowed > 0 && <span className="text-borrow">To pay: ₹{borrowed}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-semibold', net > 0 ? 'text-income' : net < 0 ? 'text-expense' : 'text-muted-foreground')}>
                    {net > 0 ? '+' : ''}{net !== 0 ? `₹${Math.abs(net)}` : 'Settled'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                  {txns.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {t.type === 'lend' ? <ArrowUpRight className="w-3.5 h-3.5 text-lend" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-borrow" />}
                        <span className="text-muted-foreground">{t.note}</span>
                      </div>
                      <span className={t.type === 'lend' ? 'text-lend' : 'text-borrow'}>₹{t.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {Object.keys(people).length === 0 && <p className="text-center text-muted-foreground text-sm py-12">No lending activity yet</p>}
      </div>
      <BottomNav />
    </div>
  );
}
