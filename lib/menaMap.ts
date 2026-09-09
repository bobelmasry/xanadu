// Pure data + geometry helpers for the Network section's MapLibre MENA map.
// Kept side-effect free (no maplibre-gl runtime import) so it can be unit
// tested in a node environment. Real WGS84 coordinates, not the old stylized
// SVG viewBox positions.

import type { StyleSpecification } from 'maplibre-gl'

export interface MenaCity {
  id: string
  name: string
  lat: number
  lng: number
  hub?: boolean
}

export const MENA_HUB_ID = 'riyadh'

export const MENA_CITIES: MenaCity[] = [
  { id: 'cairo', name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { id: 'beirut', name: 'Beirut', lat: 33.8938, lng: 35.5018 },
  { id: 'amman', name: 'Amman', lat: 31.9454, lng: 35.9284 },
  { id: 'jeddah', name: 'Jeddah', lat: 21.4858, lng: 39.1925 },
  { id: 'kuwait-city', name: 'Kuwait City', lat: 29.3759, lng: 47.9774 },
  { id: MENA_HUB_ID, name: 'Riyadh', lat: 24.7136, lng: 46.6753, hub: true },
  { id: 'manama', name: 'Manama', lat: 26.2285, lng: 50.586 },
  { id: 'doha', name: 'Doha', lat: 25.2854, lng: 51.531 },
  { id: 'abu-dhabi', name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
  { id: 'dubai', name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { id: 'muscat', name: 'Muscat', lat: 23.588, lng: 58.3829 },
]

export function getMenaHub(): MenaCity {
  const hubs = MENA_CITIES.filter((c) => c.hub)
  if (hubs.length !== 1) {
    throw new Error(`MENA_CITIES must define exactly one hub, found ${hubs.length}`)
  }
  return hubs[0]
}

/** LngLatBoundsLike `[[west, south], [east, north]]` covering every city. */
export function menaBounds(): [[number, number], [number, number]] {
  const lats = MENA_CITIES.map((c) => c.lat)
  const lngs = MENA_CITIES.map((c) => c.lng)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

export interface HubLineFeature {
  type: 'Feature'
  properties: { city: string; hub: string }
  geometry: { type: 'LineString'; coordinates: [number, number][] }
}

export interface HubLinesCollection {
  type: 'FeatureCollection'
  features: HubLineFeature[]
}

/** One LineString per non-hub city, radiating from the Riyadh hub. */
export function hubLinesGeoJSON(): HubLinesCollection {
  const hub = getMenaHub()
  return {
    type: 'FeatureCollection',
    features: MENA_CITIES.filter((c) => !c.hub).map((c) => ({
      type: 'Feature' as const,
      properties: { city: c.name, hub: hub.name },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [hub.lng, hub.lat],
          [c.lng, c.lat],
        ],
      },
    })),
  }
}

// ── Keyless raster basemap styles ─────────────────────────────────────────
// Both are free and require no API key. CARTO Positron is the default (the
// classic light "Google Maps" look); OSM is a drop-in fallback — swap the
// `style` passed to `new maplibregl.Map()` in components/MenaMap.tsx.

const OSM_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> contributors'

export const CARTO_POSITRON_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: `${OSM_ATTRIBUTION} · © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>`,
    },
  },
  layers: [{ id: 'carto-base', type: 'raster', source: 'carto' }],
}

export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [{ id: 'osm-base', type: 'raster', source: 'osm' }],
}
