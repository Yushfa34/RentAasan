import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { ReportsPage } from '@/components/app/ReportsPage';
export const Route = createFileRoute('/_authenticated/reports')({
  head: () => ({ meta: [
    { title: 'Reports — RentAasan' },
    { name: 'description', content: 'Monthly income, pending rent and property reports with PDF and CSV export.' },
    { property: 'og:title', content: 'Reports — RentAasan' },
    { property: 'og:description', content: 'Monthly income, pending rent and property reports with PDF and CSV export.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="landlord"><ReportsPage /></Workspace>; }
