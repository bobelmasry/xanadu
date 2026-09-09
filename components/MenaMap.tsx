"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  NavigationControl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  MENA_CITIES,
  MenaCity,
  menaBounds,
  hubLinesGeoJSON,
  CARTO_POSITRON_STYLE,
} from '../lib/menaMap'

const REGION_VIEW = { padding: 36, maxZoom: 5.4 }

/**
 * Interactive MapLibre map of Xanadu's MENA network (Google-Maps-style pan /
 * zoom / popups on free CARTO Positron tiles — no API key).
 *
 * Scroll-safety: `cooperativeGestures` is on, so the wheel/touchpad scrolls
 * the page (Ctrl+wheel zooms the map) and a single finger pans the page
 * (two fingers manipulate the map) — the Lenis scroll journey is never
 * hijacked. Zoom buttons + pinch still work.
 *
 * Mobile: only one popup is open at a time (opening one closes the others,
 * like Google Maps); markers/chips are sized down below 640px via the
 * .mena-marker classes; the container uses fluid aspect-ratio heights.
 *
 * The WebGL context is only created when the section nears the viewport
 * (IntersectionObserver), and everything is torn down on unmount
 * (reactStrictMode double-run safe). If WebGL init fails (old WebView,
 * context loss), a static city-list fallback renders instead of a broken
 * canvas.
 */
export default function MenaMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [activeId, setActiveId] = useState<string>('region')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let observer: IntersectionObserver | null = null
    const markers = markersRef.current
    let openPopupId: string | null = null

    const closeAllPopups = () => {
      markers.forEach((m) => {
        if (m.getPopup().isOpen()) m.togglePopup()
      })
      openPopupId = null
    }

    const initMap = () => {
      if (cancelled || mapRef.current) return

      let map: MapLibreMap
      try {
        map = new MapLibreMap({
          container,
          style: CARTO_POSITRON_STYLE,
          bounds: menaBounds(),
          fitBoundsOptions: REGION_VIEW,
          cooperativeGestures: true,
          attributionControl: { compact: true },
        })
      } catch {
        setFailed(true) // no/broken WebGL — show the static fallback
        return
      }
      mapRef.current = map
      map.addControl(
        new NavigationControl({ showCompass: false }),
        'bottom-right'
      )

      // Tile/network errors are common (offline, blocked CDN) and must not
      // count as a hard failure — the map still renders what it has. Only
      // throw before first load marks the map unusable.
      let sawLoad = false
      map.on('error', () => {
        if (!sawLoad && !cancelled) {
          // Defer so we're outside the error dispatch.
          setTimeout(() => {
            if (!cancelled && !sawLoad) {
              setFailed(true)
            }
          }, 0)
        }
      })

      map.on('load', () => {
        if (mapRef.current !== map) return
        sawLoad = true
        map.addSource('hub-lines', { type: 'geojson', data: hubLinesGeoJSON() })
        map.addLayer({
          id: 'hub-lines',
          type: 'line',
          source: 'hub-lines',
          paint: {
            'line-color': '#3D5A80',
            'line-width': 1.4,
            'line-opacity': 0.38,
          },
        })
        setReady(true)
      })

      for (const city of MENA_CITIES) {
        const el = document.createElement('button')
        el.type = 'button'
        el.title = city.name
        el.className = city.hub ? 'mena-marker mena-marker--hub' : 'mena-marker'
        el.setAttribute(
          'aria-label',
          `${city.name} — ${city.hub ? 'regional hub' : 'network city'}`
        )

        const popup = new Popup({
          offset: 14,
          closeButton: false,
          maxWidth: '180px',
        }).setHTML(
          `<strong style="font-size:13px;color:#17202c">${city.name}</strong><br/>` +
            `<span style="font-size:11px;color:#5a6a80">${city.hub ? 'Regional hub' : 'Network city'} · Xanadu MENA</span>`
        )

        // Google-Maps behavior: opening a popup closes the previous one so
        // popups never stack on top of each other (critical on phones).
        popup.on('open', () => {
          const currentId = openPopupId
          openPopupId = city.id
          if (currentId && currentId !== city.id) {
            const prev = markers.get(currentId)
            if (prev && prev.getPopup().isOpen()) prev.togglePopup()
          }
        })

        const marker = new Marker({ element: el })
          .setLngLat([city.lng, city.lat])
          .setPopup(popup)
          .addTo(map)
        markers.set(city.id, marker)
      }

      // Clicking the map background closes any open popup (marker clicks are
      // separate DOM elements and never reach this handler).
      map.on('click', closeAllPopups)
    }

    // Defer WebGL init until the section is ~300px from the viewport.
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer?.disconnect()
          initMap()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(container)

    return () => {
      cancelled = true
      observer?.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
      markers.clear()
      setReady(false)
    }
  }, [])

  const focusCity = useCallback((id: string) => {
    const map = mapRef.current
    if (!map) return
    setActiveId(id)

    const closeAllPopups = () => {
      markersRef.current.forEach((m) => {
        if (m.getPopup().isOpen()) m.togglePopup()
      })
    }

    if (id === 'region') {
      closeAllPopups()
      map.fitBounds(menaBounds(), { ...REGION_VIEW, duration: 1200 })
      return
    }

    const city: MenaCity | undefined = MENA_CITIES.find((c) => c.id === id)
    const marker = markersRef.current.get(id)
    if (!city || !marker) return

    closeAllPopups()
    map.flyTo({
      center: [city.lng, city.lat],
      zoom: city.hub ? 7 : 8,
      duration: 1600,
      essential: true,
    })
    if (!marker.getPopup().isOpen()) marker.togglePopup()
  }, [])

  // Static, non-WebGL fallback (old WebViews / blocked tiles): the network
  // story still reads — hub + cities + coverage note, no interactivity.
  if (failed) {
    return (
      <div className="mena-map">
        <div
          className="flex aspect-[4/3] sm:aspect-[16/10] w-full max-h-[440px] flex-col items-center justify-center gap-3 rounded-xl px-6 text-center"
          style={{ background: 'rgba(61,90,128,0.08)' }}
          role="region"
          aria-label="Xanadu MENA network cities"
        >
          <p className="text-sm font-medium" style={{ color: '#fff' }}>
            ★ Riyadh — regional hub
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {MENA_CITIES.filter((c) => !c.hub)
              .map((c) => c.name)
              .join(' · ')}
          </p>
          <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}>
            Interactive map unavailable on this device
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mena-map">
      <div
        ref={containerRef}
        className="aspect-[4/3] sm:aspect-[16/10] w-full max-h-[440px] rounded-xl overflow-hidden"
        role="region"
        aria-label="Interactive map of Xanadu's MENA network"
      />
      {/* Google-Maps-style chip bar: single scrollable row on phones,
          centered wrap on >=sm. */}
      <div className="mena-chips mt-4 flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible">
        <button
          type="button"
          onClick={() => focusCity('region')}
          aria-pressed={activeId === 'region'}
          className="mena-chip shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors"
          style={{
            border: `1px solid ${activeId === 'region' ? '#3D5A80' : 'rgba(255,255,255,0.12)'}`,
            background:
              activeId === 'region' ? 'rgba(61,90,128,0.25)' : 'rgba(255,255,255,0.04)',
            color: activeId === 'region' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Full region
        </button>
        {MENA_CITIES.map((c) => {
          const isActive = activeId === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => focusCity(c.id)}
              aria-pressed={isActive}
              className="mena-chip shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors"
              style={{
                border: `1px solid ${isActive ? '#3D5A80' : 'rgba(255,255,255,0.12)'}`,
                background: isActive ? 'rgba(61,90,128,0.25)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {c.hub ? `★ ${c.name}` : c.name}
            </button>
          )
        })}
      </div>
      {!ready && (
        <p
          className="mt-3 text-center text-xs uppercase"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}
        >
          Loading map…
        </p>
      )}
    </div>
  )
}
