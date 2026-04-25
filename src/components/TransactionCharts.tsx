import { useMemo } from 'react';
import { Transaction } from '@/store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, subDays, subWeeks, subMonths, subYears, isSameDay, isSameWeek, isSameMonth, isSameYear, parseISO } from 'date-fns';
import ClientOnly from './ClientOnly';

interface Props {
  transactions: Transaction[];
}

export default function TransactionCharts({ transactions }: Props) {
  const chartData = useMemo(() => {
    const now = new Date();

    // Helper to calculate totals for a date range
    const getTotals = (date: Date, type: 'day' | 'week' | 'month' | 'year') => {
      const filtered = transactions.filter(t => {
        const txnDate = parseISO(t.date);
        if (type === 'day') return isSameDay(txnDate, date);
        if (type === 'week') return isSameWeek(txnDate, date, { weekStartsOn: 1 });
        if (type === 'month') return isSameMonth(txnDate, date);
        if (type === 'year') return isSameYear(txnDate, date);
        return false;
      });

      const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      return { expense, income };
    };

    // Daily (Last 7 days)
    const daily = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    }).map(date => ({
      name: format(date, 'EEE'),
      ...getTotals(date, 'day')
    }));

    // Weekly (Last 4 weeks)
    const weekly = Array.from({ length: 4 }).map((_, i) => {
      const date = subWeeks(now, 3 - i);
      return {
        name: `W${format(date, 'w')}`,
        ...getTotals(date, 'week')
      };
    });

    // Monthly (Last 6 months)
    const monthly = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, 5 - i);
      return {
        name: format(date, 'MMM'),
        ...getTotals(date, 'month')
      };
    });

    // Yearly (Last 3 years)
    const yearly = Array.from({ length: 3 }).map((_, i) => {
      const date = subYears(now, 2 - i);
      return {
        name: format(date, 'yyyy'),
        ...getTotals(date, 'year')
      };
    });

    return { daily, weekly, monthly, yearly };
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/50 p-3 rounded-2xl shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: p.color }}>{p.name}:</span>
                <span className="text-sm font-extrabold">₹{p.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = (data: any[]) => (
    <div className="h-[200px] w-full mt-4">
      <ClientOnly>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fontWeight: 700, fill: 'hsl(var(--muted-foreground))', opacity: 0.7 }}
              dy={10}
            />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="expense" 
              name="Expense"
              stroke="hsl(var(--expense))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="Income"
              stroke="hsl(var(--income))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ClientOnly>
    </div>
  );

  return (
    <div className="glass-card p-6 border-none shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Financial Overview</h2>
          <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-tighter mt-0.5">Income vs Expense flow</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-income" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-expense" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Expense</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/40 p-1 rounded-xl h-9">
          <TabsTrigger value="daily" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Day</TabsTrigger>
          <TabsTrigger value="weekly" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Week</TabsTrigger>
          <TabsTrigger value="monthly" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Month</TabsTrigger>
          <TabsTrigger value="yearly" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Year</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="outline-none focus:ring-0">{renderChart(chartData.daily)}</TabsContent>
        <TabsContent value="weekly" className="outline-none focus:ring-0">{renderChart(chartData.weekly)}</TabsContent>
        <TabsContent value="monthly" className="outline-none focus:ring-0">{renderChart(chartData.monthly)}</TabsContent>
        <TabsContent value="yearly" className="outline-none focus:ring-0">{renderChart(chartData.yearly)}</TabsContent>
      </Tabs>
    </div>
  );
}
