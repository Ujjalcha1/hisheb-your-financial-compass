import { useMemo } from 'react';
import { Transaction } from '@/store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, subDays, subWeeks, subMonths, subYears, isSameDay, isSameWeek, isSameMonth, isSameYear, parseISO } from 'date-fns';

interface Props {
  transactions: Transaction[];
}

export default function TransactionCharts({ transactions }: Props) {
  const chartData = useMemo(() => {
    const now = new Date();

    // Daily (Last 7 days)
    const daily = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    }).map(date => {
      const amount = transactions
        .filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), date))
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: format(date, 'EEE'), amount };
    });

    // Weekly (Last 4 weeks)
    const weekly = Array.from({ length: 4 }).map((_, i) => {
      const date = subWeeks(now, 3 - i);
      const amount = transactions
        .filter(t => t.type === 'expense' && isSameWeek(parseISO(t.date), date, { weekStartsOn: 1 }))
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: `W${format(date, 'w')}`, amount };
    });

    // Monthly (Last 6 months)
    const monthly = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, 5 - i);
      const amount = transactions
        .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), date))
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: format(date, 'MMM'), amount };
    });

    // Yearly (Last 3 years)
    const yearly = Array.from({ length: 3 }).map((_, i) => {
      const date = subYears(now, 2 - i);
      const amount = transactions
        .filter(t => t.type === 'expense' && isSameYear(parseISO(t.date), date))
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: format(date, 'yyyy'), amount };
    });

    return { daily, weekly, monthly, yearly };
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-md border border-border/50 p-3 rounded-2xl shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-extrabold text-primary">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const hasData = useMemo(() => {
    return Object.values(chartData).some(data => data.some(item => item.amount > 0));
  }, [chartData]);

  const renderChart = (data: any[]) => (
    <div className="h-[200px] w-full mt-4 flex items-center justify-center relative">
      {!hasData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px] rounded-2xl z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">No data for this period</p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
            animationDuration={1500}
            baseLine={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="glass-card p-6 border-none shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Spending Analysis</h2>
          <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-tighter mt-0.5">Expense flow across time</p>
        </div>
      </div>
      
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/40 p-1 rounded-xl h-9">
          <TabsTrigger value="daily" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Day</TabsTrigger>
          <TabsTrigger value="weekly" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Week</TabsTrigger>
          <TabsTrigger value="monthly" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Month</TabsTrigger>
          <TabsTrigger value="yearly" className="text-[9px] uppercase font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Year</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="outline-none">{renderChart(chartData.daily)}</TabsContent>
        <TabsContent value="weekly" className="outline-none">{renderChart(chartData.weekly)}</TabsContent>
        <TabsContent value="monthly" className="outline-none">{renderChart(chartData.monthly)}</TabsContent>
        <TabsContent value="yearly" className="outline-none">{renderChart(chartData.yearly)}</TabsContent>
      </Tabs>
    </div>
  );
}
