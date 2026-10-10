import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { TenantPage } from '@/components/app/LandlordPages';
export const Route = createFileRoute('/_authenticated/tenants/$id')({
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
function Page() { const { id } = Route.useParams(); return <Workspace role="landlord"><TenantPage id={id} /></Workspace>; }
