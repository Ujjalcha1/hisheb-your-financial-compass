import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from '@/assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setAuthenticated(true);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-16 pb-8">
      <img src={logo} alt="Hisheb" width={64} height={64} className="rounded-xl mb-4" />
      <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
      <p className="text-muted-foreground text-sm mb-8">Sign in to continue tracking</p>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email or Phone</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-border/50 h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary border-border/50 h-12 rounded-xl"
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base gradient-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </Button>


        <div className="flex justify-between text-sm pt-2">
          <Link to="/forgot-password" className="text-primary hover:underline">Forgot Password?</Link>
          <Link to="/register" className="text-primary hover:underline">Create Account</Link>
        </div>
      </form>
    </div>
  );
}
