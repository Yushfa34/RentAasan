import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { MyComplaint } from '@/components/app/TenantPages';
export const Route = createFileRoute('/_authenticated/my-complaints/$id')({
  head: () => ({ meta: [
    { title: 'My Complaints — RentAasan' },
    { name: 'description', content: 'My Complaints in your RentAasan account.' },
    { property: 'og:title', content: 'My Complaints — RentAasan' },
    { property: 'og:description', content: 'My Complaints in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { const { id } = Route.useParams(); return <Workspace role="tenant"><MyComplaint id={id} /></Workspace>; }
