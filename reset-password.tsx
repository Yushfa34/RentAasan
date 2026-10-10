import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/app/ui-kit';
import { errMsg } from '@/lib/format';
export const Route = createFileRoute('/reset-password')({ head: () => ({ meta: [{ title: 'Reset password — RentAasan' }, { name: 'description', content: 'Set a new password for your RentAasan account.' }, { property: 'og:title', content: 'Reset password — RentAasan' }, { property: 'og:description', content: 'Set a new password for your RentAasan account.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }), component: ResetPassword });
function ResetPassword() {
  const [valid, setValid] = useState(false); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { const hash = new URLSearchParams(window.location.hash.slice(1)); setValid(hash.get('type') === 'recovery'); const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (event === 'PASSWORD_RECOVERY') setValid(true); }); return () => subscription.unsubscribe(); }, []);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? errMsg(error) : 'Password updated. You can log in now.'); setBusy(false); }
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5"><h1 className="text-3xl font-bold">Reset your password</h1>{valid ? <form onSubmit={submit} className="mt-6 space-y-4"><Field label="New password"><Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} /></Field><Button type="submit" disabled={busy}>Save password</Button></form> : <p className="mt-4 text-muted-foreground">Open the password reset link from your email to continue.</p>}{message && <p role="status" className="mt-4">{message}</p>}<Button asChild variant="link" className="mt-4 self-start px-0"><Link to="/auth">Back to login</Link></Button></main>;
}
