import { describe, it, expect } from 'vitest'
import {
  MENA_CITIES,
  MENA_HUB_ID,
  getMenaHub,
  menaBounds,
  hubLinesGeoJSON,
  CARTO_POSITRON_STYLE,
  OSM_STYLE,
} from '../lib/menaMap'

describe('MENA cities data', () => {
  it('defines unique ids and names for every city', () => {
    expect(new Set(MENA_CITIES.map((c) => c.id)).size).toBe(MENA_CITIES.length)
    expect(new Set(MENA_CITIES.map((c) => c.name)).size).toBe(MENA_CITIES.length)
  })

  it('defines exactly one hub (Riyadh)', () => {
    expect(getMenaHub().id).toBe(MENA_HUB_ID)
    expect(getMenaHub().name).toBe('Riyadh')
  })

  it('keeps all coordinates within valid WGS84 ranges', () => {
    for (const c of MENA_CITIES) {
      expect(c.lat).toBeGreaterThan(-90)
      expect(c.lat).toBeLessThan(90)
      expect(c.lng).toBeGreaterThan(-180)
      expect(c.lng).toBeLessThan(180)
    }
  })
})

describe('menaBounds', () => {
  it('returns [[west, south], [east, north]] extremes across all cities', () => {
    const [[west, south], [east, north]] = menaBounds()
    expect(west).toBeCloseTo(31.2357, 4) // Cairo
    expect(south).toBeCloseTo(21.4858, 4) // Jeddah
    expect(east).toBeCloseTo(58.3829, 4) // Muscat
    expect(north).toBeCloseTo(33.8938, 4) // Beirut
  })

  it('produces a well-ordered bounds pair', () => {
    const [[west, south], [east, north]] = menaBounds()
    expect(west).toBeLessThan(east)
    expect(south).toBeLessThan(north)
  })
})

describe('hubLinesGeoJSON', () => {
  it('draws one line from the hub to every non-hub city', () => {
    const fc = hubLinesGeoJSON()
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(MENA_CITIES.length - 1)
  })

  it('starts every line at the hub coordinates and ends at its city', () => {
    const hub = getMenaHub()
    const fc = hubLinesGeoJSON()
    for (const f of fc.features) {
      expect(f.geometry.type).toBe('LineString')
      expect(f.geometry.coordinates[0]).toEqual([hub.lng, hub.lat])
      const end = f.geometry.coordinates[1]
      const city = MENA_CITIES.find(
        (c) => c.lat === end[1] && c.lng === end[0]
      )
      expect(city).toBeDefined()
      expect(city!.name).toBe(f.properties.city)
    }
  })

  it('never draws a line from the hub to itself', () => {
    const hub = getMenaHub()
    for (const f of hubLinesGeoJSON().features) {
      expect(f.geometry.coordinates[1]).not.toEqual([hub.lng, hub.lat])
    }
  })
})

describe('basemap styles', () => {
  it('are keyless raster styles with attribution (no Google API)', () => {
    for (const style of [CARTO_POSITRON_STYLE, OSM_STYLE]) {
      expect(style.version).toBe(8)
      const sources = Object.values(style.sources)
      expect(sources).toHaveLength(1)
      expect(sources[0].type).toBe('raster')
      expect((sources[0] as { attribution?: string }).attribution).toMatch(
        /OpenStreetMap/
      )
      for (const url of (sources[0] as { tiles: string[] }).tiles) {
        expect(url).not.toContain('googleapis')
        expect(url).not.toContain('key=')
      }
    }
  })
})
