"use client"
import React, { memo } from 'react'
import SubsidiarySection from '../SubsidiarySection'
import { getSubsidiary } from '../../lib/subsidiaries'

interface Props {
  onContactClick?: () => void
  variant?: 'summary' | 'full'
}

export default memo(function SportsSection({ onContactClick, variant }: Props) {
  const s = getSubsidiary('sports')!
  return (
    <SubsidiarySection
      {...s}
      variant={variant}
      onCtaClick={onContactClick}
    />
  )
})
