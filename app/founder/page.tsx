import PlaceholderPage from '../../components/PlaceholderPage'

export const metadata = {
  alternates: { canonical: '/founder' },
  title: 'About the Founder — Xanadu',
  description:
    'Meet Hessain Al Menawy, the founder leading Xanadu — building more than companies: the foundation of a next-generation family office shaping the future of MENA business.',
}

export default function FounderPage() {
  return (
    <PlaceholderPage
      eyebrow="About the Founder"
      title="Hessain Al Menawy."
      subtitle="Founder of Xanadu Group. Leading a multi-disciplinary business group across MENA — building more than just companies: the foundation of a next-generation family office that will shape the future of MENA business."
    />
  )
}
