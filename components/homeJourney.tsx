import type { ComponentType } from 'react'
import { SUBSIDIARY_IDS } from '../lib/subsidiaries'
import HeroSection from './HeroSection'
import AboutSection from './sections/AboutSection'
import SubsidiariesIntroSection from './sections/SubsidiariesIntroSection'
import ConsultingSection from './sections/ConsultingSection'
import SoftSection from './sections/SoftSection'
import SportsSection from './sections/SportsSection'
import VenturesSection from './sections/VenturesSection'
import TradingSection from './sections/TradingSection'
import Xw3Section from './sections/Xw3Section'
import InvestmentsSection from './sections/InvestmentsSection'
import PartnersSection from './sections/PartnersSection'
import NetworkSection from './sections/NetworkSection'
import FinalCTA from './FinalCTA'

/**
 * The single source of truth for the home-page scroll journey: one ordered
 * entry per section. Previously the order existed twice (app/page.tsx
 * composition + ScrollProgress.SECTIONS) plus once in the coupling test —
 * now `page.tsx` renders this list, `ScrollProgress.SECTIONS` is derived
 * from it, and `test/consistency.test.ts` pins it.
 *
 * `id`s are load-bearing: the section components' root `<section id>` must
 * match (BrandMarkAssembly measures bands by `getElementById(layer.id)` and
 * the dot nav + coupling tests key off these ids).
 *
 * Chapter order: hero → "Who are we" (about) → the "Our Subsidiaries"
 * chapter (intro heading + the six subsidiary sections in `lib/subsidiaries.ts`
 * order) → investments → partners → network → final CTA.
 *
 * Adding a subsidiary: add the entry in `lib/subsidiaries.ts` order and
 * update BrandMarkAssembly.LAYERS + a `/logos/parts/<id>.png` slice + sitemap.
 */

/** Props superset every section in the journey tolerates (all optional). */
export type SectionProps = {
  onContactClick?: () => void
  variant?: 'summary' | 'full'
}

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
