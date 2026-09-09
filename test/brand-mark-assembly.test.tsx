// @vitest-environment jsdom
// Regression guard for the BrandMarkAssembly ticker: mounts, and the
// quickSetter-driven update loop applies opacity writes to the overlay and
// every layer. (jsdom's getBoundingClientRect is all-zeros, so the degenerate
// geometry resolves every band to full progress — perfect for asserting the
// writes themselves without a real layout.)
import { describe, it, expect, vi, beforeAll } from 'vitest'
import React from 'react'
import { render, cleanup, act } from '@testing-library/react'
import BrandMarkAssembly, { LAYERS } from '../components/BrandMarkAssembly'

// The component measures subsidiary sections by id for its scroll bands.
beforeAll(() => {
  const hero = document.createElement('section')
  hero.id = 'hero'
  document.body.appendChild(hero)
  for (const l of LAYERS) {
    const el = document.createElement('section')
    el.id = l.id
    document.body.appendChild(el)
  }
})

describe('BrandMarkAssembly', () => {
  it('applies ticker opacity writes to the overlay and every layer', () => {
    vi.useFakeTimers()
    const { container, unmount } = render(<BrandMarkAssembly />)

    // Boot recompute (150ms timeout) + a few ticker frames.
    act(() => {
      vi.advanceTimersByTime(400)
    })

    // The overlay div is the component root (fixed, zIndex 6, opacity 0 at
    // SSR). With jsdom's degenerate geometry the band math resolves to full
    // progress, so the ticker must have faded it to 1 via quickSetter.
    const overlay = container.firstElementChild as HTMLDivElement
    expect(overlay).toBeTruthy()
    expect(overlay.style.opacity).toBe('1')

    // Every layer must have received its opacity write (band progress 1).
    const layers = Array.from(container.querySelectorAll<SVGGElement>('[data-layer]'))
    expect(layers.length).toBe(LAYERS.length)
    for (const layer of layers) {
      expect(layer.style.opacity).toBe('1')
    }

    unmount()
    vi.useRealTimers()
    cleanup()
  })
})
