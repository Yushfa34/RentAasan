import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/app/Workspace';
import { Dashboard } from '@/components/app/LandlordPages';
export const Route = createFileRoute('/_authenticated/dashboard')({
  head: () => ({ meta: [
    { title: 'Landlord dashboard — RentAasan' },
    { name: 'description', content: 'Landlord dashboard in your RentAasan account.' },
    { property: 'og:title', content: 'Landlord dashboard — RentAasan' },
    { property: 'og:description', content: 'Landlord dashboard in your RentAasan account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Page,
});
function Page() { return <Workspace role="landlord"><Dashboard /></Workspace>; }
