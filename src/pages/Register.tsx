import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill required fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please accept terms'); return; }
    navigate('/otp-verify');
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-12 pb-8">
      <h1 className="text-2xl font-bold mb-1">Create Account</h1>
      <p className="text-muted-foreground text-sm mb-6">Start tracking your finances today</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        {[
          { id: 'name', label: 'Full Name', placeholder: 'John Doe', type: 'text' },
          { id: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' },
          { id: 'phone', label: 'Phone (optional)', placeholder: '+1 234 567 890', type: 'tel' },
          { id: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
          { id: 'confirm', label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
        ].map(({ id, label, placeholder, type }) => (
          <div key={id} className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type={type} placeholder={placeholder} value={(form as any)[id]} onChange={(e) => update(id, e.target.value)} className="bg-secondary border-border/50 h-11 rounded-xl" />
          </div>
        ))}

        {form.password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strengthLabels[strength]}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
          <label htmlFor="terms" className="text-sm text-muted-foreground">I accept the Terms & Privacy Policy</label>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" className="w-full h-12 rounded-xl font-semibold gradient-primary">
          Create Account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
