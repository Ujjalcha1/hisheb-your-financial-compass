import { useStore } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['hsl(155,89%,69%)', 'hsl(210,80%,60%)', 'hsl(35,90%,60%)', 'hsl(0,72%,60%)', 'hsl(280,60%,60%)', 'hsl(180,60%,50%)'];

export default function Reports() {
  const transactions = useStore((s) => s.transactions);
  const month = new Date().toISOString().slice(0, 7);

  const monthTxns = transactions.filter((t) => t.date.startsWith(month));
  const totalIncome = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const catData = monthTxns
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  const pieData = Object.entries(catData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const exp = transactions.filter((t) => t.type === 'expense' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
    const inc = transactions.filter((t) => t.type === 'income' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
    return { label, expense: exp, income: inc };
  });

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold mb-4">Reports & Insights</h1>
      </div>

      {/* Monthly Summary */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card">
          <p className="text-xs text-muted-foreground mb-1">Total Income</p>
          <p className="text-lg font-bold text-income">₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="glass-card">
          <p className="text-xs text-muted-foreground mb-1">Total Expense</p>
          <p className="text-lg font-bold text-expense">₹{totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Donut Chart */}
      {pieData.length > 0 && (
        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Spending Breakdown</h2>
          <div className="glass-card flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pieData} innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pieData.slice(0, 5).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span>{d.name}</span>
                  </div>
                  <span className="text-muted-foreground">₹{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Last 6 Months</h2>
        <div className="glass-card">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={months}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'hsl(220,60%,10%)', border: 'none', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="income" fill="hsl(155,89%,69%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(0,72%,60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories */}
      {pieData.length > 0 && (
        <div className="px-5">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Top Spending Categories</h2>
          <div className="space-y-2">
            {pieData.slice(0, 3).map((d, i) => (
              <div key={d.name} className="glass-card flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                  <span className="text-sm font-medium">{d.name}</span>
                </div>
                <span className="text-sm font-semibold text-expense">₹{d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
