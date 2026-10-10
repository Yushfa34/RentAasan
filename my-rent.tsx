import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { MyRent } from '@/components/app/TenantPages';
export const Route = createFileRoute('/_authenticated/my-rent')({
  head: () => ({ meta: [
    { title: 'My Rent — RentAasan' },
    { name: 'description', content: 'My Rent in your RentAasan account.' },
    { property: 'og:title', content: 'My Rent — RentAasan' },
    { property: 'og:description', content: 'My Rent in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="tenant"><MyRent /></Workspace>; }
