"use client"
import React, { memo } from 'react'
import SubsidiarySection from '../SubsidiarySection'
import PortfolioGrid from '../PortfolioGrid'
import { getSubsidiary } from '../../lib/subsidiaries'

interface Props {
  onContactClick?: () => void
  variant?: 'summary' | 'full'
}

export default memo(function VenturesSection({ onContactClick, variant }: Props) {
  const { portfolio, ...s } = getSubsidiary('ventures')!
  return (
    <SubsidiarySection {...s} variant={variant} onCtaClick={onContactClick}>
      {portfolio && (
        <>
          <PortfolioGrid items={portfolio} accent={s.color} variant="tagged" />
          {/* The Xanadu Advantage (from the ventures profile) */}
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.25em] mb-5" style={{ color: 'var(--text-muted)' }}>The Xanadu Advantage</p>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI-Powered Framework — accelerating development with rapid prototyping and MVP creation.</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Robust Network — access to entrepreneurs, investors, and industry experts.</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Proven Experience — a team that has built, scaled, and successfully exited startups.</p>
              <p className="text-sm font-medium" style={{ color: s.color }}>Human expertise + AI acceleration = 3x faster venture building.</p>
            </div>
          </div>
        </>
      )}
    </SubsidiarySection>
  )
})
