import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { MyHome } from '@/components/app/TenantPages';
export const Route = createFileRoute('/_authenticated/my-home')({
  head: () => ({ meta: [
    { title: 'Tenant dashboard — RentAasan' },
    { name: 'description', content: 'Tenant dashboard in your RentAasan account.' },
    { property: 'og:title', content: 'Tenant dashboard — RentAasan' },
    { property: 'og:description', content: 'Tenant dashboard in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="tenant"><MyHome /></Workspace>; }
