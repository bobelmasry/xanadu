import type { ComponentType } from 'react'
import { SUBSIDIARY_IDS } from '../lib/subsidiaries'
import HeroSection from '../components/HeroSection'
import {
  AboutSection,
  SubsidiariesIntroSection,
  ConsultingSection,
  SoftSection,
  SportsSection,
  VenturesSection,
  TradingSection,
  Xw3Section,
  InvestmentsSection,
  PartnersSection,
  MapSection,
  NetworkSection,
  SectionProps,
} from './homeSections'
import FinalCTA from '../components/FinalCTA'

export interface JourneySection {
  /** Must equal the component's `<section id>` (load-bearing — see above). */
  id: string
  /** Scroll-dot label (ScrollProgress). */
  label: string
  Component: ComponentType<SectionProps>
}

export const HOME_JOURNEY: JourneySection[] = [
  { id: 'hero', label: 'Start', Component: HeroSection },
  { id: 'about', label: 'About', Component: AboutSection },
  { id: 'our-subsidiaries', label: 'Subsidiaries', Component: SubsidiariesIntroSection },
  { id: 'consulting', label: 'Consulting', Component: ConsultingSection },
  { id: 'soft', label: 'Soft', Component: SoftSection },
  { id: 'sports', label: 'Sports', Component: SportsSection },
  { id: 'ventures', label: 'Ventures', Component: VenturesSection },
  { id: 'trading', label: 'Trading', Component: TradingSection },
  { id: 'xw3', label: 'Web3', Component: Xw3Section },
  { id: 'investments', label: 'Investments', Component: InvestmentsSection },
  { id: 'partners', label: 'Partners', Component: PartnersSection },
  { id: 'map', label: 'Map', Component: MapSection },
  { id: 'network', label: 'Network', Component: NetworkSection },
  { id: 'final-cta', label: 'Connect', Component: FinalCTA },
]

/**
 * Subsidiary id → its section component, for the `/subsidiaries/[slug]`
 * detail route (full variant). Derived from the journey so the two can't
 * drift — every subsidiary must appear exactly once in the journey.
 */
export const SUBSIDIARY_SECTIONS: Record<string, ComponentType<SectionProps>> =
  Object.fromEntries(
    SUBSIDIARY_IDS.map((id) => {
      const entry = HOME_JOURNEY.find((s) => s.id === id)
      if (!entry) {
        throw new Error(
          `Subsidiary "${id}" has no home-journey entry — add it to HOME_JOURNEY in lib order.`
        )
      }
      return [id, entry.Component]
    })
  )
