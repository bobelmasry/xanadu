import PlaceholderPage from '../../components/PlaceholderPage'

export const metadata = {
  alternates: { canonical: '/about' },
  title: 'About Us — Xanadu',
  description:
    'Xanadu is a multi-disciplinary business group founded and led by Hessain Al Menawy — building and scaling businesses across emerging sectors in MENA with global vision and local execution.',
}

export default function AboutPage() {
  return (
    <PlaceholderPage
      eyebrow="About Xanadu"
      title="Global vision, local execution."
      subtitle="A multi-disciplinary business group continuing a legacy of entrepreneurship and innovation across the MENA region — operating at the intersection of traditional industries and digital transformation, with offices in Egypt, Oman, and Mauritius."
    />
  )
}
