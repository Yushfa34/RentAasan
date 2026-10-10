import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { TenantsPage } from '@/components/app/LandlordPages';
export const Route = createFileRoute('/_authenticated/tenants')({
  head: () => ({ meta: [
    { title: 'Tenants — RentAasan' },
    { name: 'description', content: 'Tenants in your RentAasan account.' },
    { property: 'og:title', content: 'Tenants — RentAasan' },
    { property: 'og:description', content: 'Tenants in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="landlord"><TenantsPage /></Workspace>; }
