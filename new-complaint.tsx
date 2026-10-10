import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { NewComplaint } from '@/components/app/TenantPages';
export const Route = createFileRoute('/_authenticated/new-complaint')({
  head: () => ({ meta: [
    { title: 'New Complaint — RentAasan' },
    { name: 'description', content: 'New Complaint in your RentAasan account.' },
    { property: 'og:title', content: 'New Complaint — RentAasan' },
    { property: 'og:description', content: 'New Complaint in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="tenant"><NewComplaint /></Workspace>; }
