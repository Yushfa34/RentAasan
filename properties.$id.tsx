import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { PropertyPage } from '@/components/app/LandlordPages';
export const Route = createFileRoute('/_authenticated/properties/$id')({
  head: () => ({ meta: [
    { title: 'Properties — RentAasan' },
    { name: 'description', content: 'Properties in your RentAasan account.' },
    { property: 'og:title', content: 'Properties — RentAasan' },
    { property: 'og:description', content: 'Properties in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { const { id } = Route.useParams(); return <Workspace role="landlord"><PropertyPage id={id} /></Workspace>; }
