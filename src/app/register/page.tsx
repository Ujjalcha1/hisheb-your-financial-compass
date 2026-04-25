'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setInitialChecking(false);
      }
    };
    checkUser();
  }, [router]);

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  })();

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-destructive', 'bg-borrow', 'bg-lend', 'bg-primary'];

  if (initialChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const validatePhone = (phone: string) => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(phone.replace('+91', '').trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill required fields'); return; }
    if (form.phone && !validatePhone(form.phone)) { setError('Please enter a valid 10-digit Indian phone number'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please accept terms'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone ? (form.phone.startsWith('+91') ? form.phone : `+91${form.phone}`) : null,
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col items-center min-h-screen px-8 bg-[#fafafa] dark:bg-[#050505] pt-12 pb-12">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create Account</h1>
          <p className="text-muted-foreground font-medium">Start tracking your finances today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/[0.03]">
          {[
            { id: 'name', label: 'Full Name', placeholder: 'John Doe', type: 'text' },
            { id: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' },
            { id: 'phone', label: 'Phone (optional)', placeholder: '98765 43210', type: 'tel' },
            { id: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
            { id: 'confirm', label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
          ].map(({ id, label, placeholder, type }) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">{label}</Label>
              <div className="relative">
                <Input 
                  id={id} 
                  type={
                    id === 'password' ? (showPassword ? 'text' : 'password') :
                    id === 'confirm' ? (showConfirm ? 'text' : 'password') :
                    type
                  } 
                  placeholder={placeholder} 
                  value={(form as any)[id]} 
                  onChange={(e) => update(id, e.target.value)} 
                  className={cn(
                    "bg-secondary/50 border-border/30 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm",
                    (id === 'password' || id === 'confirm') && "pr-10"
                  )} 
                />
                {(id === 'password' || id === 'confirm') && (
                  <button
                    type="button"
                    onClick={() => id === 'password' ? setShowPassword(!showPassword) : setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {id === 'password' ? (showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) :
                     (showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                  </button>
                )}
              </div>
            </div>
          ))}

          {form.password && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= strength ? strengthColors[strength] : 'bg-muted/50'}`} />
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Strength: <span className={strengthColors[strength].replace('bg-', 'text-')}>{strengthLabels[strength]}</span></p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="rounded-md border-border/40" />
            <label htmlFor="terms" className="text-[11px] font-medium text-muted-foreground cursor-pointer">I accept the <span className="text-primary hover:underline">Terms & Privacy Policy</span></label>
          </div>

          {error && <p className="text-destructive text-xs font-bold ml-1 animate-pulse">{error}</p>}

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl font-bold text-lg gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all mt-4" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account…</span>
              </div>
            ) : 'Create Account'}
          </Button>

          <p className="text-center text-xs font-medium text-muted-foreground mt-4">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
