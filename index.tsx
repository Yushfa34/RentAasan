import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Building2, FileText, MessageSquare, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/app/Logo';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'RentAasan — A better way to manage your rental' },
    { name: 'description', content: 'Manage properties, tenants, rent and maintenance in one place with RentAasan.' },
    { property: 'og:title', content: 'RentAasan — A better way to manage your rental' },
    { property: 'og:description', content: 'Manage properties, tenants, rent and maintenance in one place with RentAasan.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Welcome,
});
function Welcome() {
  return <div className="min-h-screen bg-background">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6"><Logo /><Button asChild variant="outline"><Link to="/auth">Log in <ArrowRight /></Link></Button></header>
    <main className="mx-auto max-w-6xl px-5"><div className="grid items-center gap-12 border-b py-16 md:grid-cols-2 md:py-24"><div><span className="mb-5 inline-flex rounded-full bg-success-soft px-4 py-2 text-sm font-semibold text-success">Rental living, simplified</span><h1 className="max-w-xl text-5xl font-extrabold leading-tight md:text-6xl">RentAasan</h1><p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">One clear place for your properties, monthly rent and maintenance. Less chasing. More peace of mind.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/auth">Get started <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline"><Link to="/auth">I already have an account</Link></Button></div></div><div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-card md:p-10"><div className="mb-10 flex items-center justify-between"><span className="text-sm font-bold">Your rental overview</span><Building2 className="size-7 opacity-70" /></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-primary-foreground/10 p-5"><p className="text-sm opacity-75">Properties</p><p className="mt-3 text-3xl font-bold">02</p></div><div className="rounded-xl bg-primary-foreground/10 p-5"><p className="text-sm opacity-75">Tenants</p><p className="mt-3 text-3xl font-bold">03</p></div></div><div className="mt-3 flex items-center gap-3 rounded-xl bg-card p-5 text-foreground"><span className="rounded-xl bg-success-soft p-3 text-success"><Wallet /></span><div><p className="font-semibold">Rent is under control</p><p className="text-sm text-muted-foreground">Track every payment in one place</p></div></div></div></div><div className="grid gap-8 py-12 sm:grid-cols-3"><div className="flex gap-3"><Building2 className="shrink-0 text-primary"/><div><h2 className="font-bold">Properties & tenants</h2><p className="mt-1 text-sm text-muted-foreground">Every detail, easy to find.</p></div></div><div className="flex gap-3"><FileText className="shrink-0 text-success"/><div><h2 className="font-bold">Rent & documents</h2><p className="mt-1 text-sm text-muted-foreground">A clear record of what matters.</p></div></div><div className="flex gap-3"><MessageSquare className="shrink-0 text-primary"/><div><h2 className="font-bold">Maintenance</h2><p className="mt-1 text-sm text-muted-foreground">Stay on top of every request.</p></div></div></div></main>
  </div>;
}
