import { useState } from 'react';
import { useStore, TransactionType } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import AddTransactionSheet from '@/components/AddTransactionSheet';
import { TrendingDown, TrendingUp, Wallet, Plus, ArrowUpRight, ArrowDownLeft, HandCoins, Handshake } from 'lucide-react';

export default function Dashboard() {
  const { user, transactions } = useStore();
  const [showAdd, setShowAdd] = useState(false);

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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-muted-foreground text-sm">Good morning,</p>
        <h1 className="text-xl font-bold">{user?.name ?? 'User'} 👋</h1>
      </div>

      {/* Summary Cards */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Today's Expense", value: todayExpense, icon: TrendingDown, color: 'text-expense' },
          { label: 'Monthly Expense', value: monthExpense, icon: TrendingDown, color: 'text-expense' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-lg font-bold">${value.toFixed(2)}</p>
          </div>
        ))}
        <div className="glass-card col-span-2 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Remaining Balance</span>
            </div>
            <p className="text-2xl font-bold text-primary">${balance.toFixed(2)}</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, color }) => (
            <button key={label} onClick={() => setShowAdd(true)} className="glass-card flex flex-col items-center gap-2 py-3 hover:scale-105 transition-transform">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Recent Transactions</h2>
        <div className="space-y-2">
          {recent.map((t) => (
            <div key={t.id} className="glass-card flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  {typeIcon[t.type]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.category}</p>
                  <p className="text-xs text-muted-foreground">{t.note}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-income' : t.type === 'expense' ? 'text-expense' : t.type === 'lend' ? 'text-lend' : 'text-borrow'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AddTransactionSheet open={showAdd} onOpenChange={setShowAdd} />
      <BottomNav />
    </div>
  );
}
