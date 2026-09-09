import React, { memo } from 'react'
import type { PortfolioItem } from '../lib/subsidiaries'

interface PortfolioGridProps {
  items: PortfolioItem[]
  /** Subsidiary accent color (name/heading tint). */
  accent: string
  /** Section heading above the grid (defaults to 'Portfolio'). */
  heading?: string
  /**
   * 'tagged' — name + tag pill + stealth pill (Ventures).
   * 'plain'  — colored h3 + description (Trading).
   */
  variant?: 'tagged' | 'plain'
}

/**
 * The shared portfolio grid rendered as custom content inside
 * `SubsidiarySection` on the detail pages (Ventures + Trading). Extracted
 * from two near-identical copies in their section files.
 */
export default memo(function PortfolioGrid({
  items,
  accent,
  heading = 'Portfolio',
  variant = 'plain',
}: PortfolioGridProps) {
  if (items.length === 0) return null

  return (
    <div className="mt-8">
      <p className="text-xs uppercase tracking-[0.25em] mb-5" style={{ color: 'var(--text-muted)' }}>
        {heading}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((p) =>
          variant === 'tagged' ? (
            <div key={p.name} className="glass-card p-5 group cursor-default">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-lg font-semibold" style={{ color: accent }}>{p.name}</span>
                {p.tag && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    {p.tag}
                  </span>
                )}
                {p.stealth && (
                  <span
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(15,23,42,0.05)', color: 'var(--text-muted)' }}
                  >
                    Stealth
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
            </div>
          ) : (
            <div key={p.name} className="glass-card p-5">
              <h3 className="text-base font-semibold mb-2" style={{ color: accent }}>{p.name}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
            </div>
          )
        )}
      </div>
    </div>
  )
})
