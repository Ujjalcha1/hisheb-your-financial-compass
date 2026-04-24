'use client';

import { useState } from 'react';
import { useStore, TransactionType, PaymentMethod } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Search, Trash2, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const filters = ['all', 'expense', 'income', 'lend', 'borrow'] as const;

const typeIcon: Record<TransactionType, React.ReactNode> = {
  expense: <TrendingDown className="w-4 h-4 text-expense" />,
  income: <TrendingUp className="w-4 h-4 text-income" />,
  lend: <ArrowUpRight className="w-4 h-4 text-lend" />,
  borrow: <ArrowDownLeft className="w-4 h-4 text-borrow" />,
};

export default function Transactions() {
  const { transactions, removeTransaction } = useStore();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      removeTransaction(id);
      toast.success('Transaction deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete transaction');
    }
  };
  const [filter, setFilter] = useState<typeof filters[number]>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .filter((t) => t.note.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, t) => {
    (acc[t.date] = acc[t.date] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold mb-4">Transactions</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary border-border/50 h-11 rounded-xl pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors', filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, txns]) => (
          <div key={date}>
            <p className="text-xs text-muted-foreground font-medium mb-2">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <div className="space-y-2">
              {txns.map((t) => (
                <div key={t.id} className="glass-card flex items-center justify-between py-3 group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">{typeIcon[t.type]}</div>
                    <div>
                      <p className="text-sm font-medium">{t.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.note}{t.paymentMethod ? ` • ${t.paymentMethod}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm font-semibold', t.type === 'income' ? 'text-income' : t.type === 'expense' ? 'text-expense' : t.type === 'lend' ? 'text-lend' : 'text-borrow')}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                    </p>
                    <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-12">No transactions found</p>}
      </div>
      <BottomNav />
    </div>
  );
}
