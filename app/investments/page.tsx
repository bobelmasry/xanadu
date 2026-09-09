import InvestmentsSection from '../../components/sections/InvestmentsSection'

export const metadata = {
  alternates: { canonical: '/investments' },
  title: 'Investments — Xanadu',
  description:
    'Xanadu invests in companies that shape markets and create long-term value across MENA.',
}

export default function InvestmentsPage() {
  return (
    <main className="pt-16" style={{ background: 'var(--bg-primary)' }}>
      <InvestmentsSection variant="full" />
    </main>
  )
}
