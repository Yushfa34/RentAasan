import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { Documents } from '@/components/app/TenantPages';
export const Route = createFileRoute('/_authenticated/documents')({
  head: () => ({ meta: [
    { title: 'Documents — RentAasan' },
    { name: 'description', content: 'Documents in your RentAasan account.' },
    { property: 'og:title', content: 'Documents — RentAasan' },
    { property: 'og:description', content: 'Documents in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="tenant"><Documents /></Workspace>; }
