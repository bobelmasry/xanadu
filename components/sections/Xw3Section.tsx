"use client"
import React, { memo } from 'react'
import SubsidiarySection from '../SubsidiarySection'
import { getSubsidiary } from '../../lib/subsidiaries'

interface Props {
  onContactClick?: () => void
  variant?: 'summary' | 'full'
}

export default memo(function Xw3Section({ onContactClick, variant }: Props) {
  const s = getSubsidiary('xw3')!
  return (
    <SubsidiarySection
      {...s}
      variant={variant}
      onCtaClick={onContactClick}
    />
  )
})
