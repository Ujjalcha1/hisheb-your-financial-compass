import { useState } from 'react';
import { useStore, TransactionType, PaymentMethod, PAYMENT_METHODS } from '@/store/useStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ShoppingBag, Utensils, Car, Film, Home, Briefcase, Gift, HeartPulse, GraduationCap, MoreHorizontal, Wallet, Smartphone, CreditCard, Landmark, Banknote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const paymentIcons: Record<PaymentMethod, React.ElementType> = {
  Cash: Banknote,
  UPI: Smartphone,
  'Credit Card': CreditCard,
  'Debit Card': CreditCard,
  'Net Banking': Landmark,
  Wallet: Wallet,
  Other: MoreHorizontal,
};

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
  const addCategory = useStore((s) => s.addCategory);
  const customCategories = useStore((s) => s.customCategories);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [note, setNote] = useState('');
  const [person, setPerson] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  const handleSave = async () => {
    if (!amount || !category) return;
    
    let finalCategory = category;
    if (category === 'Other' && newCategory) {
      finalCategory = newCategory;
      addCategory(newCategory);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to save transactions');
      return;
    }

    const txnData = {
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      category: finalCategory,
      note,
      date,
      person: person || undefined,
      payment_method: paymentMethod,
    };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([txnData])
        .select()
        .single();

      if (error) throw error;

      addTransaction({
        id: data.id,
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        note: data.note || '',
        date: data.date,
        person: data.person || undefined,
        paymentMethod: data.payment_method as PaymentMethod,
      });

      toast.success('Transaction saved');
      setAmount(''); setCategory(''); setNewCategory(''); setNote(''); setPerson(''); setPaymentMethod('Cash');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save to database');
      console.error(err);
    }
  };

  const cats = categories[type];
  const allCats = [...cats, ...customCategories.map(c => ({ label: c, icon: MoreHorizontal }))];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-card border-border/40 max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center text-xl font-bold">Add Transaction</SheetTitle>
        </SheetHeader>

        <Tabs value={type} onValueChange={(v) => { setType(v as TransactionType); setCategory(''); }} className="mt-6">
          <TabsList className="w-full bg-secondary/50 p-1 rounded-2xl h-12">
            {(['expense', 'income', 'lend', 'borrow'] as const).map((t) => (
              <TabsTrigger key={t} value={t} className="flex-1 capitalize rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">{t}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-6 mt-6 pb-6">
          <div className="space-y-3">
            <Label className="text-sm font-semibold ml-1">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₹</span>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (parseFloat(val) < 0) return;
                  setAmount(val);
                }} 
                min="0.01"
                step="0.01"
                className="bg-secondary/50 border-border/30 h-16 rounded-2xl text-3xl font-bold text-center pl-10 focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold ml-1">Category</Label>
            <div className="grid grid-cols-4 gap-3">
              {cats.map(({ label, icon: Icon }) => (
                <button 
                  key={label} 
                  onClick={() => setCategory(label)} 
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200', 
                    category === label 
                      ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105' 
                      : 'border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:border-border/30'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
              {customCategories.map((c) => (
                <button 
                  key={c} 
                  onClick={() => setCategory(c)} 
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200', 
                    category === c 
                      ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105' 
                      : 'border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:border-border/30'
                  )}
                >
                  <MoreHorizontal className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {category === 'Other' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-sm font-semibold ml-1">New Category Name</Label>
              <Input 
                placeholder="Enter category name" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)} 
                className="bg-secondary/50 border-border/30 h-12 rounded-xl focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          )}

          {(type === 'lend' || type === 'borrow') && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold ml-1">Person</Label>
              <Input 
                placeholder="Name" 
                value={person} 
                onChange={(e) => setPerson(e.target.value)} 
                className="bg-secondary/50 border-border/30 h-12 rounded-xl" 
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold ml-1">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="bg-secondary/50 border-border/30 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/30">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = paymentIcons[m];
                    return (
                      <SelectItem key={m} value={m} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{m}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold ml-1">Date</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="bg-secondary/50 border-border/30 h-12 rounded-xl" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold ml-1">Note</Label>
            <Input 
              placeholder="What's this for?" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              className="bg-secondary/50 border-border/30 h-12 rounded-xl" 
            />
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full h-14 rounded-2xl font-bold text-lg gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all mt-4" 
            disabled={!amount || !category || (category === 'Other' && !newCategory)}
          >
            Save Transaction
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
