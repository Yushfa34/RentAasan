import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { ProfilePage } from '@/components/app/ProfilePage';
import { useMe } from '@/hooks/use-me';
export const Route = createFileRoute('/_authenticated/profile')({
  head: () => ({ meta: [
    { title: 'My profile — RentAasan' },
    { name: 'description', content: 'My profile in your RentAasan account.' },
    { property: 'og:title', content: 'My profile — RentAasan' },
    { property: 'og:description', content: 'My profile in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { const me = useMe(); return <Workspace role={me.role}><ProfilePage /></Workspace>; }
