import Link from 'next/link'
import { SUBSIDIARIES } from '../../lib/subsidiaries'

export const metadata = {
  alternates: { canonical: '/subsidiaries' },
  title: 'Subsidiaries — Xanadu',
  description:
    'Explore the Xanadu subsidiaries — a connected system spanning strategy, technology, ventures, trading, and Web3 across MENA.',
}

export default function SubsidiariesPage() {
  return (
    <main className="relative min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <article className="section-container pt-32 md:pt-40 pb-24">
        <p
          className="text-sm uppercase tracking-[0.3em] mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          Subsidiaries
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-6 leading-tight max-w-2xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          One system, specialized parts.
        </h1>
        <p
          className="text-lg leading-relaxed mb-16 max-w-2xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          Xanadu brings together specialized subsidiaries across consulting,
          software, sports, ventures, trading, and Web3 — each operating
          independently, all connected by one continuous growth system.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBSIDIARIES.map((s) => (
            <Link
              key={s.id}
              href={`/subsidiaries/${s.id}`}
              className="glass-card group relative block overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Accent top bar in the subsidiary's color. */}
              <span
                className="absolute top-0 inset-x-0 h-px"
                style={{ background: s.color, boxShadow: `0 0 16px ${s.color}` }}
                aria-hidden="true"
              />

              <div className="flex items-start justify-between mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element -- subsidiary logo */}
                <img
                  src={s.logo}
                  alt=""
                  aria-hidden="true"
                  width={224}
                  height={224}
                  loading="lazy"
                  className="h-16 w-16 object-contain"
                  style={{ filter: `drop-shadow(0 0 12px ${s.color})` }}
                />
                <span
                  className="h-2.5 w-2.5 rounded-full mt-2"
                  style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }}
                  aria-hidden="true"
                />
              </div>

              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: s.color, fontFamily: 'var(--font-heading)' }}
              >
                {s.name}
              </h2>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                {s.hookText}
              </p>

              <span
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
              >
                View details
                <span style={{ color: s.color }}>→</span>
              </span>
            </Link>
          ))}
        </div>

        <div
          className="mt-16 pt-8"
          style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            ← Back to home
          </Link>
        </div>
      </article>
    </main>
  )
}
