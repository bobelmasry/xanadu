import PlaceholderPage from '../../components/PlaceholderPage'

export const metadata = {
  alternates: { canonical: '/portfolio' },
  title: 'Our Portfolio — Xanadu',
  description:
    'A look at the companies, ventures, and partnerships across the Xanadu ecosystem.',
}

export default function PortfolioPage() {
  return (
    <PlaceholderPage
      eyebrow="Our Portfolio"
      title="Built across the ecosystem."
      subtitle="A snapshot of the companies, ventures, and partnerships that make up the Xanadu portfolio."
    />
  )
}
