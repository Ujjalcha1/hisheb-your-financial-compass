'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import { Lock, Tag, Moon, Download, LogOut, ChevronRight, Plus, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const { user, customCategories, categories: defaultCategories, addCategory, removeCategory, resetAll } = useStore();
  const { isDark, toggle: toggleTheme } = useTheme();

  const categories = [...defaultCategories, ...customCategories];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      resetAll();
      router.push('/login');
    } catch (err) {
      toast.error('Error signing out');
    }
  };

  const [pwdOpen, setPwdOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password state
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Category state
  const [newCat, setNewCat] = useState('');

  const handleChangePassword = async () => {
    if (!newPwd || newPwd !== confirmPwd) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPwd.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      
      toast.success('Password updated successfully');
      setNewPwd(''); setConfirmPwd('');
      setPwdOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCat = () => {
    const v = newCat.trim();
    if (!v) return;
    addCategory(v);
    setNewCat('');
  };

  const handleExport = () => {
    const txns = useStore.getState().transactions;
    
    // Detailed rows with Debit/Credit
    const rows = txns.map((t) => ({
      Date: t.date,
      Category: t.category,
      Debit: (t.type === 'expense' || t.type === 'lend') ? t.amount : 0,
      Credit: (t.type === 'income' || t.type === 'borrow') ? t.amount : 0,
      'Payment Method': t.paymentMethod ?? '',
      Note: t.note,
    }));

    // Monthly summary and savings
    const summaryData = Object.entries(
      txns.reduce((acc, t) => {
        const month = t.date.slice(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { Credit: 0, Debit: 0 };
        if (t.type === 'income' || t.type === 'borrow') acc[month].Credit += t.amount;
        else acc[month].Debit += t.amount;
        return acc;
      }, {} as any)
    ).map(([month, totals]: [string, any]) => ({
      Month: month,
      'Total Credit': totals.Credit,
      'Total Debit': totals.Debit,
      Savings: totals.Credit - totals.Debit
    })).sort((a, b) => b.Month.localeCompare(a.Month));

    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Monthly Summary (Showing first as requested)
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Monthly Summary');

    // Sheet 2: Transactions (Detailed view)
    const wsTxns = XLSX.utils.json_to_sheet(rows);
    wsTxns['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsTxns, 'Detailed Transactions');

    XLSX.writeFile(wb, `hisheb-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Exported with Monthly Summary');
  };

  const prefItems = [
    { icon: Tag, label: 'Manage Categories', onClick: () => setCatOpen(true) },
  ];
  const dataItems = [
    { icon: Download, label: 'Export Data', onClick: handleExport },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold mb-4">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-6">
        <div className="glass-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div>
            <p className="font-semibold">{user?.name ?? 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Account */}
      <Section title="Account">
        <Row icon={Lock} label="Change Password" onClick={() => setPwdOpen(true)} />
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        {prefItems.map(({ icon: Icon, label, onClick }) => (
          <Row key={label} icon={Icon} label={label} onClick={onClick} />
        ))}
        <Row
          icon={Moon}
          label="Dark Mode"
          right={<Switch checked={isDark} onCheckedChange={toggleTheme} />}
        />
      </Section>

      {/* Data */}
      <Section title="Data">
        {dataItems.map(({ icon: Icon, label, onClick }) => (
          <Row key={label} icon={Icon} label={label} onClick={onClick} />
        ))}
      </Section>

      {/* Logout */}
      <div className="px-5 mt-6">
        <button onClick={handleLogout} className="w-full glass-card flex items-center justify-center gap-2 py-3.5 text-destructive font-medium hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your new password below</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPwdOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={loading} className="gradient-primary">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>Add or remove your expense categories</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="New category"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
                className="h-11 rounded-xl"
              />
              <Button onClick={handleAddCat} size="icon" className="h-11 w-11 rounded-xl gradient-primary shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {categories.map((c) => (
                <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
                  <span>{c}</span>
                  <button onClick={() => removeCategory(c)} className="hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 mb-6">
      <p className="text-xs text-muted-foreground font-medium mb-2">{title}</p>
      <div className="glass-card divide-y divide-border/30 p-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  danger,
  onClick,
  right,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick && !right}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <Icon className={cn('w-4 h-4', danger ? 'text-destructive' : 'text-muted-foreground')} />
        <span className={cn('text-sm', danger && 'text-destructive')}>{label}</span>
      </div>
      {right ? right : value ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{value}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}
