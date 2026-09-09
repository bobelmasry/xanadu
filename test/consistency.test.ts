import { describe, it, expect, afterEach, vi } from 'vitest'
import { SUBSIDIARIES, SUBSIDIARY_IDS } from '../lib/subsidiaries'
import { SECTIONS } from '../components/ScrollProgress'
import { LAYERS } from '../components/BrandMarkAssembly'
import { getCalendarUrl } from '../lib/contactConfig'

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

describe('ScrollProgress dot list', () => {
  // Mirrors app/page.tsx composition order. If a section id changes, update
  // both the component and this list.
  const EXPECTED = [
    'hero', 'consulting', 'soft', 'sports', 'about', 'ventures',
    'trading', 'xw3', 'investments', 'partners', 'network', 'final-cta',
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
