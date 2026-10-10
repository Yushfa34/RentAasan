import { useState, type FormEvent } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getMe, type Role } from '@/lib/api';
import { errMsg } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/app/ui-kit';
import { Logo } from '@/components/app/Logo';
export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Sign in or register — RentAasan' }, { name: 'description', content: 'Sign in or create your RentAasan landlord or tenant account.' }, { property: 'og:title', content: 'Sign in or register — RentAasan' }, { property: 'og:description', content: 'Sign in or create your RentAasan landlord or tenant account.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Auth,
});
function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [role, setRole] = useState<Role>('landlord');
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'forgot') { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error; setNotice('If this email has an account, a reset link is on its way.'); }
      else if (mode === 'signup') { const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/auth', data: { full_name: name, phone, role } } }); if (error) throw error; if (!data.session) setNotice('Check your email to confirm your account, then log in.'); else { const me = await getMe(); navigate({ to: me?.role === 'tenant' ? '/my-home' : '/dashboard' }); } }
      else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; const me = await getMe(); navigate({ to: me?.role === 'tenant' ? '/my-home' : '/dashboard' }); }
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  }
  return <div className="min-h-screen bg-background md:grid md:grid-cols-2"><div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground md:flex"><Logo /><div><p className="mb-5 text-sm font-semibold uppercase opacity-70">Welcome to easier renting</p><h1 className="max-w-md text-5xl font-extrabold leading-tight">A better way to feel at home.</h1><p className="mt-6 max-w-md text-lg opacity-80">Everything you need to keep rental life organised, in one calm place.</p></div><p className="text-sm opacity-60">RentAasan © 2026</p></div><div className="flex min-h-screen flex-col px-5 py-7 md:px-14 md:py-12"><div className="flex items-center justify-between"><Link to="/" className="md:hidden"><Logo /></Link><Button asChild variant="ghost" className="ml-auto"><Link to="/"><ArrowLeft /> Back to home</Link></Button></div><div className="mx-auto my-auto w-full max-w-md py-12"><p className="text-sm font-semibold text-success">RENTAASAN ACCOUNT</p><h2 className="mt-2 text-3xl font-bold">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}</h2><p className="mt-2 text-muted-foreground">{mode === 'login' ? 'Log in to pick up where you left off.' : mode === 'signup' ? 'Get set up in just a moment.' : 'We’ll email you a link to choose a new password.'}</p>
    {mode !== 'forgot' && <div className="mt-7 flex rounded-xl bg-muted p-1"><Button type="button" variant={mode === 'login' ? 'outline' : 'ghost'} className="flex-1" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>Log in</Button><Button type="button" variant={mode === 'signup' ? 'outline' : 'ghost'} className="flex-1" onClick={() => { setMode('signup'); setError(''); setNotice(''); }}>Sign up</Button></div>}
    <form onSubmit={submit} className="mt-7 space-y-4">{mode === 'signup' && <><Field label="I am a"><div className="grid grid-cols-2 gap-2"><Button type="button" variant={role === 'landlord' ? 'default' : 'outline'} onClick={() => setRole('landlord')}>Landlord</Button><Button type="button" variant={role === 'tenant' ? 'default' : 'outline'} onClick={() => setRole('tenant')}>Tenant</Button></div></Field><Field label="Full name"><Input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></Field><Field label="Phone number"><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="03XX XXXXXXX" /></Field></>}
    <Field label="Email address"><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></Field>{mode !== 'forgot' && <Field label="Password"><div className="relative"><Input minLength={6} type={visible ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /><Button type="button" variant="ghost" size="icon" aria-label={visible ? 'Hide password' : 'Show password'} className="absolute right-1 top-0" onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button></div></Field>}
    {error && <p role="alert" className="rounded-xl bg-destructive-soft p-3 text-sm text-destructive">{error}</p>}{notice && <p role="status" className="rounded-xl bg-success-soft p-3 text-sm text-success">{notice}</p>}
    <Button disabled={busy} className="w-full" size="lg" type="submit">{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Send reset link'} <ArrowRight /></Button></form>{mode === 'login' && <Button variant="link" className="mt-4 px-0" onClick={() => { setMode('forgot'); setError(''); }}>Forgot password?</Button>}{mode === 'forgot' && <Button variant="link" className="mt-4 px-0" onClick={() => { setMode('login'); setError(''); }}>Back to log in</Button>}{mode === 'signup' && role === 'tenant' && <p className="mt-5 text-sm text-muted-foreground">Use the same email address your landlord added to your tenant record.</p>}</div></div></div>;
}
