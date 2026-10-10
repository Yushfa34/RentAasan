import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { RentPage } from '@/components/app/LandlordPages';
export const Route = createFileRoute('/_authenticated/rent')({
  head: () => ({ meta: [
    { title: 'Rent — RentAasan' },
    { name: 'description', content: 'Rent in your RentAasan account.' },
    { property: 'og:title', content: 'Rent — RentAasan' },
    { property: 'og:description', content: 'Rent in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="landlord"><RentPage /></Workspace>; }
