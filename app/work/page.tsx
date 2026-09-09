import Link from 'next/link'
import { getSubsidiary } from '../../lib/subsidiaries'
import { INVESTMENTS } from '../../lib/investments'
import PortfolioGrid from '../../components/PortfolioGrid'

export const metadata = {
  alternates: { canonical: '/work' },
  title: 'Our Work — Xanadu',
  description:
    'A look at the companies, ventures, projects, and clients across the Xanadu ecosystem — from AI-built startups to global trade corridors.',
}

const CLIENTS = getSubsidiary('consulting')!.clients ?? []

export default function WorkPage() {
  const ventures = getSubsidiary('ventures')!
  const trading = getSubsidiary('trading')!

  return (
    <main className="relative min-h-screen pt-16" style={{ background: 'var(--bg-primary)' }}>
      <article className="section-container pt-16 md:pt-24 pb-24">
        <p
          className="text-sm uppercase tracking-[0.3em] mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          Our Work
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-6 leading-tight max-w-2xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Built across the ecosystem.
        </h1>
        <p
          className="text-lg leading-relaxed mb-16 max-w-2xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          A snapshot of the companies, ventures, projects, and clients that
          make up the Xanadu portfolio — built by our subsidiaries across
          MENA and beyond.
        </p>

        {/* ── Portfolio ── */}
        <section aria-labelledby="work-portfolio" className="mb-20">
          <h2
            id="work-portfolio"
            className="text-2xl sm:text-3xl font-bold mb-8"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Portfolio
          </h2>
          <div className="space-y-12">
            <div>
              <div className="flex items-baseline justify-between gap-4 mb-5 flex-wrap">
                <h3 className="text-lg font-semibold" style={{ color: ventures.color, fontFamily: 'var(--font-heading)' }}>
                  {ventures.name} — venture-built startups
                </h3>
                <Link
                  href={`/subsidiaries/${ventures.id}`}
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  Explore Ventures →
                </Link>
              </div>
              <PortfolioGrid items={ventures.portfolio ?? []} accent={ventures.color} variant="tagged" heading="Ventures" />
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-4 mb-5 flex-wrap">
                <h3 className="text-lg font-semibold" style={{ color: trading.color, fontFamily: 'var(--font-heading)' }}>
                  {trading.name} — trade corridors & manufacturers
                </h3>
                <Link
                  href={`/subsidiaries/${trading.id}`}
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  Explore Trading →
                </Link>
              </div>
              <PortfolioGrid items={trading.portfolio ?? []} accent={trading.color} heading="Manufacturers & Distributors" />
            </div>
          </div>
        </section>

        {/* ── Projects ── */}
        <section aria-labelledby="work-projects" className="mb-20">
          <h2
            id="work-projects"
            className="text-2xl sm:text-3xl font-bold mb-8"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INVESTMENTS.map((inv) => (
              <div key={inv.name} className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#D9B00D' }}>✧ {inv.name}</h3>
                <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>{inv.overview}</p>
              </div>
            ))}
          </div>
          <Link
            href="/investments"
            className="inline-flex items-center gap-2 mt-8 text-sm font-medium"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
          >
            Explore Investments →
          </Link>
        </section>

        {/* ── Clients ── */}
        <section aria-labelledby="work-clients" className="mb-20">
          <h2
            id="work-clients"
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Clients
          </h2>
          <p className="text-base leading-relaxed mb-8 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            We partner with innovative companies across MENA — 1,000+ delivered
            projects across five countries, with 95% client satisfaction.
          </p>
          <div className="flex flex-wrap gap-3">
            {CLIENTS.map((c) =>
              c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- client brand logo
                <img
                  key={c.name}
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  className="h-11 w-auto max-w-[130px] object-contain px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--chip-border)' }}
                />
              ) : (
                <span
                  key={c.name}
                  className="text-sm font-semibold tracking-wide px-4 py-2 rounded-lg"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--chip-border)' }}
                >
                  {c.name}
                </span>
              )
            )}
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
            Start a project with us <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </main>
  )
}
