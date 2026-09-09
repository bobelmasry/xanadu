import React from 'react'
import Link from 'next/link'

interface PlaceholderPageProps {
  eyebrow: string
  title: string
  subtitle: string
  children?: React.ReactNode
}

export default function PlaceholderPage({
  eyebrow,
  title,
  subtitle,
  children,
}: PlaceholderPageProps) {
  return (
    <main
      className="relative min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <article className="section-container max-w-3xl mx-auto pt-40 md:pt-48 pb-32">
        <p
          className="text-sm uppercase tracking-[0.3em] mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          {eyebrow}
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h1>
        <p
          className="text-lg leading-relaxed mb-10"
          style={{ color: 'var(--text-secondary)' }}
        >
          {subtitle}
        </p>

        {children}

        <div className="mt-16 pt-8" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
          <p className="text-sm italic mb-6" style={{ color: 'var(--text-muted)' }}>
            Content for this page is coming soon.
          </p>
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
