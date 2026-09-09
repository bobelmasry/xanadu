"use client"
import React, { memo } from 'react'
import SubsidiarySection from '../SubsidiarySection'
import PortfolioGrid from '../PortfolioGrid'
import { getSubsidiary } from '../../lib/subsidiaries'

interface Props {
  onContactClick?: () => void
  variant?: 'summary' | 'full'
}

export default memo(function TradingSection({ onContactClick, variant }: Props) {
  const { portfolio, ...s } = getSubsidiary('trading')!
  return (
    <SubsidiarySection {...s} variant={variant} onCtaClick={onContactClick}>
      {portfolio && <PortfolioGrid items={portfolio} accent={s.color} heading="Our Portfolio" />}
    </SubsidiarySection>
  )
})
