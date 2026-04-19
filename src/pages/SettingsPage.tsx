import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import { User, Lock, Tag, IndianRupee, Moon, Download, Trash2, LogOut, ChevronRight, Plus, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import * as XLSX from 'xlsx';

const CURRENCIES = [
  { symbol: '₹', label: 'Indian Rupee (₹)' },
  { symbol: '$', label: 'US Dollar ($)' },
  { symbol: '€', label: 'Euro (€)' },
  { symbol: '£', label: 'British Pound (£)' },
  { symbol: '৳', label: 'Bangladeshi Taka (৳)' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser, setAuthenticated, categories, addCategory, removeCategory, currency, setCurrency, resetAll } = useStore();
  const { isDark, toggle: toggleTheme } = useTheme();

  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  // Edit profile state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  // Password state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Category state
  const [newCat, setNewCat] = useState('');

  const handleLogout = () => {
    setAuthenticated(false);
    navigate('/login');
  };

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) return;
    setUser({ name: name.trim(), email: email.trim() });
    toast.success('Profile updated');
    setEditOpen(false);
  };

  const handleChangePassword = () => {
    if (!currentPwd || !newPwd || newPwd !== confirmPwd) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed');
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setPwdOpen(false);
  };

  const handleAddCat = () => {
    const v = newCat.trim();
    if (!v) return;
    addCategory(v);
    setNewCat('');
  };

  const handleExport = () => {
    const txns = useStore.getState().transactions;
    const rows = txns.map((t) => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      'Payment Method': t.paymentMethod ?? '',
      Person: t.person ?? '',
      Note: t.note,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `hisheb-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Exported to Excel');
  };

  const handleDeleteAccount = () => {
    resetAll();
    toast.success('Account deleted');
    navigate('/login');
  };

  const accountItems = [
    { icon: User, label: 'Edit Profile', onClick: () => { setName(user?.name ?? ''); setEmail(user?.email ?? ''); setEditOpen(true); } },
    { icon: Lock, label: 'Change Password', onClick: () => setPwdOpen(true) },
  ];
  const prefItems = [
    { icon: Tag, label: 'Manage Categories', onClick: () => setCatOpen(true) },
    { icon: IndianRupee, label: 'Currency', value: currency, onClick: () => setCurOpen(true) },
  ];
  const dataItems = [
    { icon: Download, label: 'Export Data', onClick: handleExport },
    { icon: Trash2, label: 'Delete Account', danger: true, onClick: () => setDelOpen(true) },
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
        {accountItems.map(({ icon: Icon, label, onClick }) => (
          <Row key={label} icon={Icon} label={label} onClick={onClick} />
        ))}
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        {prefItems.map(({ icon: Icon, label, value, onClick }) => (
          <Row key={label} icon={Icon} label={label} value={value} onClick={onClick} />
        ))}
        <Row
          icon={Moon}
          label="Dark Mode"
          right={<Switch checked={isDark} onCheckedChange={toggleTheme} />}
        />
      </Section>

      {/* Data */}
      <Section title="Data">
        {dataItems.map(({ icon: Icon, label, danger, onClick }) => (
          <Row key={label} icon={Icon} label={label} danger={danger} onClick={onClick} />
        ))}
      </Section>

      {/* Logout */}
      <div className="px-5 mt-6">
        <button onClick={handleLogout} className="w-full glass-card flex items-center justify-center gap-2 py-3.5 text-destructive font-medium hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your account details</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="h-11 rounded-xl" />
            </div>
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
            <Button onClick={handleChangePassword} className="gradient-primary">Update</Button>
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

      {/* Currency Dialog */}
      <Dialog open={curOpen} onOpenChange={setCurOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Select Currency</DialogTitle>
          </DialogHeader>
          <RadioGroup value={currency} onValueChange={(v) => { setCurrency(v); toast.success('Currency updated'); setCurOpen(false); }}>
            {CURRENCIES.map((c) => (
              <label key={c.symbol} className="flex items-center justify-between px-3 py-3 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer">
                <span className="text-sm">{c.label}</span>
                <RadioGroupItem value={c.symbol} />
              </label>
            ))}
          </RadioGroup>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirm */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your profile and all transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
