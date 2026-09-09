import { describe, it, expect, afterEach, vi } from 'vitest'
import { SUBSIDIARIES, SUBSIDIARY_IDS, divisionName } from '../lib/subsidiaries'
import { SECTIONS } from '../components/ScrollProgress'
import { LAYERS } from '../components/BrandMarkAssembly'
import { getCalendarUrl, ROUTING } from '../lib/contactConfig'

/**
 * Coupling guards: several components hardcode section-id lists that silently
 * break (dead dots, wrong morph order) when a section is renamed/added.
 * These tests pin the lists to the canonical data.
 */

describe('subsidiary data invariants', () => {
  it('keeps the canonical order consulting → soft → sports → ventures → trading → xw3', () => {
    expect(SUBSIDIARY_IDS).toEqual(['consulting', 'soft', 'sports', 'ventures', 'trading', 'xw3'])
  })

  it('gives every subsidiary a logo at /logos/<id>.png', () => {
    for (const s of SUBSIDIARIES) {
      expect(s.logo).toBe(`/logos/${s.id}.png`)
    }
  })

  it('has a summary + full copy for every subsidiary', () => {
    for (const s of SUBSIDIARIES) {
      expect(s.summaryText.length).toBeGreaterThan(0)
      expect(s.description.length).toBeGreaterThan(0)
      expect(s.servicesText.length).toBeGreaterThan(0)
    }
  })
})

describe('BrandMarkAssembly layer list', () => {
  it('rides the subsidiaries in the same order (edge i ↔ arm i ↔ section id)', () => {
    expect(LAYERS.map((l) => l.id)).toEqual(SUBSIDIARY_IDS)
  })
})

describe('division routing (contact wire values)', () => {
  // The client sends ROUTING.division strings as matchedDivision; the API
  // route accepts exactly divisionName(s). Changing any of these six wire
  // values is a breaking API change — do it deliberately, then update here.
  it('derives the six expected division names', () => {
    expect(SUBSIDIARIES.map(divisionName)).toEqual([
      'Xanadu Consulting', 'Xanadu Soft', 'Xanadu Sports',
      'Xanadu Ventures', 'Xanadu Trading', 'Web3',
    ])
  })

  it('routes every contact need to a real subsidiary division + accent color', () => {
    for (const r of Object.values(ROUTING)) {
      const match = SUBSIDIARIES.find((s) => divisionName(s) === r.division)
      expect(match, `unknown division "${r.division}"`).toBeDefined()
      expect(r.color).toBe(match!.color)
    }
  })
})

describe('ScrollProgress dot list', () => {
  // Mirrors the home-page chapter order (homeJourney.tsx). If a section id
  // changes, update both the component and this list.
  const EXPECTED = [
    'hero', 'about', 'our-subsidiaries', 'consulting', 'soft', 'sports',
    'ventures', 'trading', 'xw3', 'investments', 'partners', 'network',
    'final-cta',
  ]

  it('matches the home-page section composition', () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(EXPECTED)
  })

  it('includes every subsidiary section id', () => {
    for (const id of SUBSIDIARY_IDS) {
      expect(SECTIONS.map((s) => s.id)).toContain(id)
    }
  })
})

describe('getCalendarUrl scheme guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts https URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_CALENDAR_URL', 'https://cal.com/xanadu/intro')
    expect(getCalendarUrl('free')).toBe('https://cal.com/xanadu/intro')
  })

  it('rejects javascript:/data:/http: values instead of passing them to the iframe', () => {
    vi.stubEnv('NEXT_PUBLIC_CALENDAR_URL', 'javascript:alert(1)')
    expect(getCalendarUrl('free')).toBeNull()
    vi.stubEnv('NEXT_PUBLIC_CALENDAR_URL', 'data:text/html,<script></script>')
    expect(getCalendarUrl('paid')).toBeNull()
    vi.stubEnv('NEXT_PUBLIC_CALENDAR_URL', 'http://cal.com/xanadu/intro')
    expect(getCalendarUrl('free')).toBeNull()
  })

  it('returns null when unset', () => {
    vi.stubEnv('NEXT_PUBLIC_CALENDAR_URL', '')
    expect(getCalendarUrl('free')).toBeNull()
  })
})
