'use client';

import { useState, useEffect } from 'react';
import { useStore, TransactionType, Transaction } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Search, Trash2, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownLeft, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteTransactionRemote, syncTransactions } from '@/lib/sync';
import { toast } from 'sonner';
import TransactionSheet from '@/components/TransactionSheet';

const filters = ['all', 'expense', 'income', 'lend', 'borrow'] as const;

const typeIcon: Record<TransactionType, React.ReactNode> = {
  expense: <TrendingDown className="w-4 h-4 text-expense" />,
  income: <TrendingUp className="w-4 h-4 text-income" />,
  lend: <ArrowUpRight className="w-4 h-4 text-lend" />,
  borrow: <ArrowDownLeft className="w-4 h-4 text-borrow" />,
};

export default function Transactions() {
  const { transactions } = useStore();
  const [filter, setFilter] = useState<typeof filters[number]>('all');
  const [search, setSearch] = useState('');
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (transactions.length === 0) {
      syncTransactions();
    }
  }, [transactions.length]);

  const handleDelete = async (id: string) => {
    const result = await deleteTransactionRemote(id);
    if (result.success) {
      toast.success('Transaction deleted');
    } else {
      toast.error(result.error || 'Failed to delete transaction');
    }
  };

  const handleEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setShowSheet(true);
  };

  const filtered = transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .filter((t) => 
      t.note.toLowerCase().includes(search.toLowerCase()) || 
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.person && t.person.toLowerCase().includes(search.toLowerCase()))
    );

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
          <Input 
            placeholder="Search transactions…" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="bg-secondary border-border/50 h-11 rounded-xl pl-10" 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filters.map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors', 
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              )}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, txns]) => (
          <div key={date}>
            <p className="text-xs text-muted-foreground font-medium mb-2">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <div className="space-y-2">
              {txns.map((t) => (
                <div key={t.id} className="glass-card flex items-center justify-between py-3 group border-none shadow-sm px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">{typeIcon[t.type]}</div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">
                        {t.category}
                        {t.person && <span className="text-[10px] font-medium text-muted-foreground ml-2 uppercase tracking-widest">({t.person})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.note || 'No note'}{t.paymentMethod ? ` • ${t.paymentMethod}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={cn('text-sm font-semibold', t.type === 'income' ? 'text-income' : t.type === 'expense' ? 'text-expense' : t.type === 'lend' ? 'text-lend' : 'text-borrow')}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(t)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-primary" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>

      <TransactionSheet 
        open={showSheet} 
        onOpenChange={(open) => {
          setShowSheet(open);
          if (!open) setEditingTxn(null);
        }} 
        editingTransaction={editingTxn}
      />
      
      <BottomNav />
    </div>
  );
}
