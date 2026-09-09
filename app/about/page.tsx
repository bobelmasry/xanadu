import Link from 'next/link'
import { SUBSIDIARIES } from '../../lib/subsidiaries'

export const metadata = {
  alternates: { canonical: '/about' },
  title: 'About Us — Xanadu',
  description:
    'Xanadu is a multi-disciplinary business group founded and led by Hessain Al Menawy — building and scaling businesses across emerging sectors in MENA with global vision and local execution.',
}

const MISSION = [
  'Building and scaling businesses across emerging sectors through a business development lens',
  'Bringing international thinking and digital-first strategies to address local opportunities',
  'Operating at the intersection of traditional industries and digital transformation',
]

const STATS = [
  { value: '15+ Years', label: 'Trusted expertise in MENA' },
  { value: '1,000+ Projects', label: 'Excellence across industries' },
  { value: '3 Countries', label: 'Egypt, Oman, Mauritius' },
  { value: '6 Subsidiaries', label: 'One continuous system' },
]

export default function AboutPage() {
  return (
    <main className="relative min-h-screen pt-16" style={{ background: 'var(--bg-primary)' }}>
      <article className="section-container max-w-3xl mx-auto pt-16 md:pt-24 pb-24">
        <p
          className="text-sm uppercase tracking-[0.3em] mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          About Us
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Who are we? Global vision,{' '}
          <span className="text-gradient">local execution.</span>
        </h1>
        <p
          className="text-lg leading-relaxed mb-12"
          style={{ color: 'var(--text-secondary)' }}
        >
          A multi-disciplinary business group founded and led by Hessain Al
          Menawy, continuing a legacy of entrepreneurship and innovation in
          the MENA region — building and scaling businesses across emerging
          sectors through a business development lens. We bring international
          thinking and digital-first strategies to local opportunities, with
          offices across Egypt, Oman, and Mauritius.
        </p>

        {/* ── Mission ── */}
        <section aria-labelledby="about-mission" className="mb-16">
          <h2
            id="about-mission"
            className="text-2xl sm:text-3xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Our core mission
          </h2>
          <ul className="space-y-4">
            {MISSION.map((m) => (
              <li key={m} className="glass-card p-5 flex items-start gap-4">
                <span className="text-xl leading-none mt-0.5" style={{ color: '#3D5A80' }} aria-hidden="true">⟡</span>
                <span className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>{m}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Stats ── */}
        <section aria-labelledby="about-impact" className="mb-16">
          <h2
            id="about-impact"
            className="text-2xl sm:text-3xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Regional impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STATS.map((stat) => (
              <div key={stat.value} className="glass-card p-5">
                <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Group ── */}
        <section aria-labelledby="about-group" className="mb-16">
          <h2
            id="about-group"
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            One system, specialized parts
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Xanadu brings together specialized subsidiaries — each operating
            independently, all connected by one continuous growth system.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUBSIDIARIES.map((s) => (
              <Link
                key={s.id}
                href={`/subsidiaries/${s.id}`}
                className="glass-card p-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {s.id === 'xw3' ? 'Web3' : `Xanadu ${s.name}`}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Founder ── */}
        <section aria-labelledby="about-founder" className="mb-16">
          <h2
            id="about-founder"
            className="text-2xl sm:text-3xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            About the Founder
          </h2>
          <div className="glass-card p-6 sm:p-8">
            <p className="text-xl sm:text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Hessain Al Menawy
            </p>
            <p
              className="text-xs uppercase tracking-[0.25em] mb-6"
              style={{ color: 'var(--text-muted)' }}
            >
              Founder of Xanadu Group
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Hessain Al Menawy leads a multi-disciplinary business group
              across MENA — building more than just companies. Under his
              leadership, Xanadu is building the foundation of a
              next-generation family office that will shape the future of
              MENA business.
            </p>
            <p className="text-base leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
              &ldquo;Global vision, local execution — a continuous system for
              turning opportunity into growth.&rdquo;
            </p>
          </div>
        </section>

        <div className="mt-16 pt-8" style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
          <Link
            href="/#final-cta"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
            style={{
              background: '#3D5A80',
              color: '#fff',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Talk to Xanadu <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </main>
  )
}
