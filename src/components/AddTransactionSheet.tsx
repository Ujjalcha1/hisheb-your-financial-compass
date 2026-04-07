import { useState } from 'react';
import { useStore, TransactionType } from '@/store/useStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ShoppingBag, Utensils, Car, Film, Home, Briefcase, Gift, HeartPulse, GraduationCap, MoreHorizontal } from 'lucide-react';

const categories: Record<TransactionType, { label: string; icon: React.ElementType }[]> = {
  expense: [
    { label: 'Food', icon: Utensils },
    { label: 'Transport', icon: Car },
    { label: 'Shopping', icon: ShoppingBag },
    { label: 'Entertainment', icon: Film },
    { label: 'Housing', icon: Home },
    { label: 'Health', icon: HeartPulse },
    { label: 'Education', icon: GraduationCap },
    { label: 'Other', icon: MoreHorizontal },
  ],
  income: [
    { label: 'Salary', icon: Briefcase },
    { label: 'Freelance', icon: Briefcase },
    { label: 'Gift', icon: Gift },
    { label: 'Other', icon: MoreHorizontal },
  ],
  lend: [{ label: 'Lend', icon: Gift }],
  borrow: [{ label: 'Borrow', icon: Gift }],
};

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export default function AddTransactionSheet({ open, onOpenChange }: Props) {
  const addTransaction = useStore((s) => s.addTransaction);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [person, setPerson] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!amount || !category) return;
    addTransaction({
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      category,
      note,
      date,
      person: person || undefined,
    });
    setAmount(''); setCategory(''); setNote(''); setPerson('');
    onOpenChange(false);
  };

  const cats = categories[type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-card border-border/40 max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center">Add Transaction</SheetTitle>
        </SheetHeader>

        <Tabs value={type} onValueChange={(v) => { setType(v as TransactionType); setCategory(''); }} className="mt-4">
          <TabsList className="w-full bg-secondary/50 rounded-xl">
            {(['expense', 'income', 'lend', 'borrow'] as const).map((t) => (
              <TabsTrigger key={t} value={t} className="flex-1 capitalize rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4 mt-5">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-secondary border-border/50 h-12 rounded-xl text-xl font-bold text-center" />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {cats.map(({ label, icon: Icon }) => (
                <button key={label} onClick={() => setCategory(label)} className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all', category === label ? 'border-primary bg-primary/10 text-primary' : 'border-border/30 bg-secondary/50 text-muted-foreground hover:border-border')}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {(type === 'lend' || type === 'borrow') && (
            <div className="space-y-2">
              <Label>Person</Label>
              <Input placeholder="Name" value={person} onChange={(e) => setPerson(e.target.value)} className="bg-secondary border-border/50 h-11 rounded-xl" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Note</Label>
            <Input placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)} className="bg-secondary border-border/50 h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary border-border/50 h-11 rounded-xl" />
          </div>

          <Button onClick={handleSave} className="w-full h-12 rounded-xl font-semibold gradient-primary" disabled={!amount || !category}>
            Save Transaction
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
