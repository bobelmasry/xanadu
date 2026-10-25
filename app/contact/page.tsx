import ContactFlow from '../../components/ContactFlow'

export const metadata = {
  alternates: { canonical: '/contact' },
  title: 'Talk to Xanadu — Xanadu',
  description: 'Tell us about your business and someone from the Xanadu team will be in touch.',
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="section-container">
        <div className="max-w-xl mx-auto py-32 md:py-40">
          <ContactFlow />
        </div>
      </div>
    </main>
  )
}
