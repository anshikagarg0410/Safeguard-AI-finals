import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Phone, MapPin, User as UserIcon, Shield } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const location = useLocation();
  const initialMode = new URLSearchParams(location.search).get('mode');
  const urlMode = useMemo<Mode>(() => (initialMode === 'login' || initialMode === 'signup' ? (initialMode as Mode) : 'signup'), [location.search]);
  const [mode, setMode] = useState<Mode>(urlMode);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone || undefined });
      } else {
        await login(form.email, form.password);
      }
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-sky-50 via-emerald-50 to-cyan-50 p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">SafeGuard AI</div>
          </div>
          <div className="text-muted-foreground">{mode === 'login' ? 'Welcome back to your safety dashboard' : 'Start protecting your loved ones today'}</div>
        </div>
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>{mode === 'login' ? 'Sign In' : 'Create Your Account'}</CardTitle>
            <CardDescription>{mode === 'login' ? 'Enter your credentials to access your account' : "Join SafeGuard AI and begin monitoring your family's safety and wellness"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-10" placeholder="Enter your first name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Enter your last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-10" placeholder="Enter your phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-10" placeholder="Enter your full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" type="password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-emerald-400" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign In'}
              </Button>

              <div className="text-sm text-center">
                {mode === 'signup' ? (
                  <button type="button" className="underline" onClick={() => setMode('login')}>Already have an account? Log in</button>
                ) : (
                  <button type="button" className="underline" onClick={() => setMode('signup')}>Don’t have an account? Sign up here</button>
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">← <a href="/" className="underline">Back to home</a></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


