'use client';

import { useState, useEffect } from 'react';
import { useStore, TransactionType, PaymentMethod } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import AddTransactionSheet from '@/components/AddTransactionSheet';
import { TrendingDown, TrendingUp, Wallet, Plus, ArrowUpRight, ArrowDownLeft, HandCoins, Handshake } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

import TransactionCharts from '@/components/TransactionCharts';

export default function Dashboard() {
  const { user, transactions, setTransactions } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const fetchTxns = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        toast.error('Failed to sync with cloud');
        return;
      }

      if (data) {
        setTransactions(data.map(t => ({
          id: t.id,
          type: t.type,
          amount: parseFloat(t.amount),
          category: t.category,
          note: t.note || '',
          date: t.date,
          person: t.person || undefined,
          paymentMethod: t.payment_method as PaymentMethod,
        })));
      }
    };

    fetchTxns();
  }, [setTransactions]);

  const today = new Date().toISOString().split('T')[0];
  const month = today.slice(0, 7);

  const todayExpense = transactions.filter((t) => t.type === 'expense' && t.date === today).reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions.filter((t) => t.type === 'expense' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
  const monthIncome = transactions.filter((t) => t.type === 'income' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
  const balance = monthIncome - monthExpense;

  const recent = transactions.slice(0, 5);

  const typeIcon: Record<TransactionType, React.ReactNode> = {
    expense: <TrendingDown className="w-4 h-4 text-expense" />,
    income: <TrendingUp className="w-4 h-4 text-income" />,
    lend: <ArrowUpRight className="w-4 h-4 text-lend" />,
    borrow: <ArrowDownLeft className="w-4 h-4 text-borrow" />,
  };

  const quickActions = [
    { label: 'Expense', icon: TrendingDown, color: 'text-expense' },
    { label: 'Income', icon: TrendingUp, color: 'text-income' },
    { label: 'Lend', icon: HandCoins, color: 'text-lend' },
    { label: 'Borrow', icon: Handshake, color: 'text-borrow' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen pb-28 bg-[#fafafa] dark:bg-[#050505] transition-colors duration-500">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <p className="text-muted-foreground text-sm font-medium tracking-tight uppercase opacity-70">{getGreeting()}</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{user?.name ?? 'User'} 👋</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "Today's Expense", value: todayExpense, icon: TrendingDown, color: 'text-expense', bg: 'bg-expense/5' },
          { label: 'Monthly Expense', value: monthExpense, icon: TrendingDown, color: 'text-expense', bg: 'bg-expense/5' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className={`glass-card p-5 border-none shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[${i*100}ms]`}>
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
            <p className="text-xl font-bold tracking-tight">₹{value.toFixed(0)}</p>
          </div>
        ))}
        
        <div className="glass-card col-span-2 p-6 border-none shadow-md bg-gradient-to-br from-card to-secondary/30 flex items-center justify-between relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest opacity-70">Total Balance</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tighter text-primary">₹{balance.toFixed(2)}</p>
          </div>
          <button 
            onClick={() => setShowAdd(true)} 
            className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all relative z-10"
          >
            <Plus className="w-7 h-7 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Spending Charts */}
      <div className="px-6">
        <TransactionCharts transactions={transactions} />
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
        <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map(({ label, icon: Icon, color }) => (
            <button key={label} onClick={() => setShowAdd(true)} className="glass-card flex flex-col items-center gap-3 py-4 border-none shadow-sm hover:bg-secondary/50 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Recent Activity</h2>
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest">See All</button>
        </div>
        <div className="space-y-3">
          {recent.length > 0 ? recent.map((t, i) => (
            <div key={t.id} className="glass-card flex items-center justify-between p-4 border-none shadow-sm animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${500 + i * 100}ms` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center shadow-inner">
                  {typeIcon[t.type]}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{t.category}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.note || 'No note'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.type === 'income' ? 'text-income' : t.type === 'expense' ? 'text-expense' : t.type === 'lend' ? 'text-lend' : 'text-borrow'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">{t.date}</p>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            </div>
          )}
        </div>
      </div>

      <AddTransactionSheet open={showAdd} onOpenChange={setShowAdd} />
      <BottomNav />
    </div>
  );
}
