import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { ComplaintPage } from '@/components/app/LandlordPages';
export const Route = createFileRoute('/_authenticated/complaints/$id')({
  head: () => ({ meta: [
    { title: 'Complaints — RentAasan' },
    { name: 'description', content: 'Complaints in your RentAasan account.' },
    { property: 'og:title', content: 'Complaints — RentAasan' },
    { property: 'og:description', content: 'Complaints in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { const { id } = Route.useParams(); return <Workspace role="landlord"><ComplaintPage id={id} /></Workspace>; }
