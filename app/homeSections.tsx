"use client"

import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { GeoJsonObject } from 'geojson'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ComposableMap, Geographies, Geography, useMapContext } from 'react-simple-maps'
import worldMap from 'world-atlas/countries-110m.json'
import SubsidiarySection from '../components/SubsidiarySection'
import PortfolioGrid from '../components/PortfolioGrid'
import { getSubsidiary, SUBSIDIARIES } from '../lib/subsidiaries'
import { INVESTMENTS } from '../lib/investments'
import { scrollToId } from '../lib/scroll'
import { useRevealOnScroll } from '../lib/useRevealOnScroll'

export type SectionProps = { variant?: 'summary' | 'full' }

const ABOUT_STATS: { value: string; suffix?: string; unit: string; label?: string; chips?: string[] }[] = [
  { value: '15', suffix: '+', unit: 'Years', label: 'Trusted expertise in MENA' },
  { value: '1,000', suffix: '+', unit: 'Projects', label: 'Excellence across industries' },
  { value: '3', unit: 'Countries', chips: ['Egypt', 'Oman', 'Mauritius'] },
]

export const AboutSection = memo(function AboutSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.about-reveal', duration: 1, stagger: 0.15, start: 'top 70%' })
  return <section ref={ref} id="about" className="relative py-14 md:py-28"><div className="section-container max-w-3xl mx-auto text-center">
    <p className="about-reveal text-sm uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--text-muted)' }}>About Us</p>
    <h2 className="about-reveal text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Who are we? <span className="text-gradient">Global vision, local execution.</span></h2>
    <p className="about-reveal text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>A multi-disciplinary business group founded and led by Hessain Al Menawy, continuing a legacy of entrepreneurship and innovation in the MENA region — building and scaling businesses across emerging sectors through a business development lens.</p>
    <p className="about-reveal text-base leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>We bring international thinking and digital-first strategies to local opportunities, operating at the intersection of traditional industries and digital transformation — with offices across Egypt, Oman, and Mauritius.</p>
    <div className="about-reveal grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto mt-14 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/10">{ABOUT_STATS.map((stat) => <div key={stat.unit} className="flex flex-col items-center px-6 py-7 sm:py-1">
      <p className="flex items-start leading-none mb-3" style={{ fontFamily: 'var(--font-heading)' }}><span className="text-5xl md:text-6xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>{stat.suffix && <span className="text-3xl md:text-4xl font-semibold ml-0.5" style={{ color: 'var(--accent-primary)' }}>{stat.suffix}</span>}</p>
      <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>{stat.unit}</p>
      {stat.chips ? <ul className="flex flex-wrap justify-center gap-1.5">{stat.chips.map((chip) => <li key={chip} className="text-xs px-2.5 py-1 rounded-full" style={{ border: '1px solid var(--chip-border)', color: 'var(--text-secondary)' }}>{chip}</li>)}</ul> : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>}
    </div>)}</div>
  </div></section>
})

export const SubsidiariesIntroSection = memo(function SubsidiariesIntroSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.subs-reveal', duration: 1, stagger: 0.15, start: 'top 70%' })
  return <section ref={ref} id="our-subsidiaries" className="relative pt-8 pb-32 md:pt-20 md:pb-48"><div className="section-container max-w-3xl mx-auto text-center">
    <p className="subs-reveal text-sm uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--text-muted)' }}>Our Subsidiaries</p>
    <h2 className="subs-reveal text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Six specialized companies. <span className="text-gradient">One continuous system.</span></h2>
    <p className="subs-reveal text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>Each subsidiary operates independently — and each one feeds the others. Explore how the Xanadu companies work together.</p>
    <div className="subs-reveal mx-auto mb-10 grid w-full max-w-sm grid-cols-3 items-start justify-items-center gap-x-6 gap-y-6 sm:flex sm:max-w-none sm:justify-center sm:gap-4" aria-label="Xanadu subsidiaries">
      {SUBSIDIARIES.map((subsidiary) => (
        <figure key={subsidiary.id} className="m-0 flex w-20 shrink-0 flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- subsidiary logo */}
            <img src={subsidiary.logo} alt="" className="h-auto w-full object-contain" loading="lazy" />
          </div>
          <figcaption className="text-[11px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-muted)' }}>{subsidiary.name}</figcaption>
        </figure>
      ))}
    </div>
    <button type="button" onClick={() => scrollToId('consulting', 2.2)} className="subs-reveal group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ color: 'var(--accent-primary)', background: 'rgba(var(--accent-primary-rgb), 0.08)', border: '1px solid rgba(var(--accent-primary-rgb), 0.28)', boxShadow: '0 8px 24px rgba(var(--accent-primary-rgb), 0.1)' }}>
      know more <span aria-hidden="true" className="inline-flex -translate-y-0.5 text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
    </button>
  </div></section>
})

function SubsidiaryHomeSection({ id, variant }: SectionProps & { id: string }) {
  return <SubsidiarySection {...getSubsidiary(id)!} variant={variant} />
}
export const ConsultingSection = memo(function ConsultingSection(props: SectionProps) {
  return <SubsidiaryHomeSection {...props} id="consulting" />
})
export const SoftSection = memo(function SoftSection(props: SectionProps) {
  return <SubsidiaryHomeSection {...props} id="soft" />
})
export const SportsSection = memo(function SportsSection(props: SectionProps) {
  return <SubsidiaryHomeSection {...props} id="sports" />
})
export const Xw3Section = memo(function Xw3Section(props: SectionProps) {
  return <SubsidiaryHomeSection {...props} id="xw3" />
})

export const VenturesSection = memo(function VenturesSection({ variant }: SectionProps) {
  const { portfolio, ...subsidiary } = getSubsidiary('ventures')!
  return <SubsidiarySection {...subsidiary} variant={variant}>{portfolio && <PortfolioGrid items={portfolio} accent={subsidiary.color} variant="tagged" />}</SubsidiarySection>
})

export const TradingSection = memo(function TradingSection({ variant }: SectionProps) {
  const { portfolio, ...subsidiary } = getSubsidiary('trading')!
  return <SubsidiarySection {...subsidiary} variant={variant}>{portfolio && <PortfolioGrid items={portfolio} accent={subsidiary.color} heading="Our Portfolio" />}</SubsidiarySection>
})

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)
const GOLD = '#D9B00D'
export const InvestmentsSection = memo(function InvestmentsSection({ variant = 'summary' }: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  useRevealOnScroll(ref, { selector: '.inv-reveal', stagger: 0.08 })
  useEffect(() => { if (variant === 'full') ScrollTrigger.refresh() }, [expanded, variant])
  return <section ref={ref} id="investments" className="py-14 md:py-28"><div className="section-container">
    <p className="inv-reveal text-sm uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>Investments</p>
    <h2 className="inv-reveal text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>We don&apos;t just support growth. We invest in it.</h2>
    <p className="inv-reveal text-lg mb-8" style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}>Through strategic ownership and ecosystem building, Xanadu invests in companies that shape markets and create long-term value across MENA.</p>
    {variant === 'full' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">{INVESTMENTS.map((inv, i) => <div key={inv.name} className="inv-reveal investment-card investment-card--open"><div className="investment-logo-frame investment-logo-frame--open mb-5">{inv.logo ? <img src={inv.logo} alt={`${inv.name} logo`} loading="lazy" /> : <span aria-hidden="true">{inv.name.slice(0, 2).toUpperCase()}</span>}</div>{inv.services || inv.value ? <h3 className="m-0 mb-2"><button type="button" aria-expanded={expanded === i} onClick={() => setExpanded(expanded === i ? null : i)} className="investment-toggle w-full text-left text-lg font-semibold" style={{ color: GOLD }}><span>{inv.name}</span><span aria-hidden="true" className="investment-toggle-icon">{expanded === i ? '−' : '+'}</span></button></h3> : <h3 className="text-lg font-semibold mb-2" style={{ color: GOLD }}>{inv.name}</h3>}<p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{inv.overview}</p>{inv.url && <a href={inv.url} target="_blank" rel="noopener noreferrer" aria-label={`${inv.name}: ${inv.urlLabel ?? (inv.url.includes('linkedin.com') ? 'LinkedIn' : 'website')} (opens in a new tab)`} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>{inv.urlLabel ?? (inv.url.includes('linkedin.com') ? 'LinkedIn' : 'Website')} <span aria-hidden="true">↗</span></a>}{expanded === i && <div className="investment-details mt-3 pt-4"><div className="flex flex-wrap gap-2 mb-3">{inv.services?.map((service) => <span key={service} className="text-xs px-2 py-1 rounded-full" style={{ background: `${GOLD}15`, color: GOLD }}>{service}</span>)}</div><p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{inv.value}</p></div>}</div>)}</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 mb-10">{INVESTMENTS.map((inv) => <div key={inv.name} className="inv-reveal investment-card investment-card--open"><div className="investment-logo-frame investment-logo-frame--open mb-5">{inv.logo ? <img src={inv.logo} alt={`${inv.name} logo`} loading="lazy" /> : <span aria-hidden="true">{inv.name.slice(0, 2).toUpperCase()}</span>}</div><h3 className="text-lg font-semibold mb-2" style={{ color: GOLD }}>{inv.name}</h3><p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>{inv.overview}</p></div>)}</div>}
    {variant === 'summary' && <Link href="/investments" className="inv-reveal inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}40`, color: GOLD }}>Learn more <span aria-hidden="true">→</span></Link>}
  </div></section>
})

const PARTNERS = [
  { name: 'Asfaleia', logo: '/partners/asfaleia.png' },
  { name: 'Bibliovation', logo: '/partners/Bibliovation.png' },
  { name: 'Cede Hub', logo: '/partners/cede-hub.png' },
  { name: 'CIGP', logo: '/partners/cigp.png' },
  { name: 'Clio', logo: '/partners/clio.png' },
  { name: 'Cloudbeds', logo: '/partners/cloudbeds.png' },
  { name: 'Connect Sports', logo: '/partners/connect-sports.png' },
  { name: 'El Shawarby', logo: '/partners/elshawarby.png' },
  { name: 'Entourage', logo: '/partners/entourage.png' },
  { name: 'Flow Traders', logo: '/partners/flowtraders.png' },
  { name: 'Gem', logo: '/partners/Gem .PNG' },
  { name: 'Handle EA', logo: '/partners/handle-ea.png' },
  { name: 'Lorax', logo: '/partners/lorax.png' },
  { name: 'Nexus', logo: '/partners/nexus.png' },
  { name: 'Novacap', logo: '/partners/novacap.png' },
  { name: 'OriginCX', logo: '/partners/origincx.png' },
  { name: 'Overchain', logo: '/partners/overchain.png' },
  { name: 'PToken', logo: '/partners/ptoken.png' },
  { name: 'RMP', logo: '/partners/rmp.png' },
  { name: 'Semoto', logo: '/partners/semoto.png' },
  { name: 'SMG', logo: '/partners/smg.png' },
  { name: 'TechKnowledge', logo: '/partners/techknowledge.png' },
  { name: 'Track3 Consulting', logo: '/partners/consulting/track3.png' },
  { name: 'Tremoloo', logo: '/partners/tremoloo.png' },
  { name: 'Ye Sports', logo: '/partners/ye-sports.png' },
  { name: 'Zilla Capital', logo: '/partners/Zilla capital.PNG' },
]
export const PartnersSection = memo(function PartnersSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.partner-reveal', y: 30, duration: 0.8, stagger: 0.06, start: 'top 75%' })
  return <section ref={ref} id="partners" className="py-14 md:py-28"><div className="section-container text-center"><p className="partner-reveal text-sm uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>Partners</p><h2 className="partner-reveal text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>We don&apos;t grow alone.</h2><p className="partner-reveal text-xl mb-4" style={{ color: 'var(--text-secondary)' }}>We grow through strategic alignment.</p><p className="partner-reveal text-base mb-10 mx-auto" style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>Xanadu Group has established strong strategic collaborations with global industry leaders and serves some of the most prominent organizations in the MENA region.</p><div className="partner-reveal grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-4xl mx-auto">{PARTNERS.map((partner) => <div key={partner.name} className="flex items-center justify-center">{partner.logo ? <div className="flex h-16 w-24 items-center justify-center"><img src={partner.logo} alt={partner.name} loading="lazy" className="h-full w-full object-contain" /></div> : <span className="text-sm font-semibold tracking-wide px-4 py-2 rounded-lg" style={{ color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.1)' }}>{partner.name}</span>}</div>)}</div><p className="partner-reveal mt-10 text-lg italic" style={{ color: 'var(--text-muted)' }}>Driving innovation and growth through <span style={{ color: 'var(--text-primary)' }}>powerful collaborations</span>.</p></div></section>
})

const MAP_COUNTRIES = [
  { name: 'Egypt', region: 'North Africa', coordinates: [30.8, 26.8] as [number, number], description: 'A central hub for our regional operations.' },
  { name: 'Oman', region: 'Gulf', coordinates: [57.5, 21.5] as [number, number], description: 'Our gateway into the Gulf and wider region.' },
  { name: 'Mauritius', region: 'Indian Ocean', coordinates: [57.5, -20.2] as [number, number], description: 'Our bridge to African and island markets.' },
]
const MAP_WIDTH = 800
const MAP_HEIGHT = 430
const MAP_ZOOM = 2.4

/**
 * Map contents. The world is projected once; zooming tweens a single SVG
 * transform on the land group and repositions the markers directly on the DOM,
 * so the ~180 country paths never re-render mid-animation (re-projecting them
 * every frame is what made the page stutter).
 */
function MapLayers({ activeCountry, zoomed, onSelect }: { activeCountry: string; zoomed: boolean; onSelect: (name: string) => void }) {
  const { projection } = useMapContext()
  const zoomRef = useRef<SVGGElement>(null)
  const markerRefs = useRef<(SVGGElement | null)[]>([])
  const view = useRef({ k: 1, x: 0, y: 0 })
  const points = useMemo(() => MAP_COUNTRIES.map((country) => projection(country.coordinates) as [number, number]), [projection])

  useEffect(() => {
    const apply = () => {
      const { k, x, y } = view.current
      zoomRef.current?.setAttribute('transform', `translate(${x} ${y}) scale(${k})`)
      points.forEach(([px, py], i) => markerRefs.current[i]?.setAttribute('transform', `translate(${x + k * px} ${y + k * py})`))
    }
    const [px, py] = points[Math.max(0, MAP_COUNTRIES.findIndex((country) => country.name === activeCountry))]
    const target = zoomed ? { k: MAP_ZOOM, x: MAP_WIDTH / 2 - MAP_ZOOM * px, y: MAP_HEIGHT / 2 - MAP_ZOOM * py } : { k: 1, x: 0, y: 0 }
    const tween = gsap.to(view.current, { ...target, duration: 0.9, ease: 'power3.inOut', overwrite: true, onUpdate: apply })
    apply()
    return () => {
      tween.kill()
    }
  }, [activeCountry, zoomed, points])

  return <>
    <g ref={zoomRef}>
      <Geographies geography={worldMap as unknown as GeoJsonObject}>
        {({ geographies }) => geographies.map((geo) => {
          const country = MAP_COUNTRIES.find((item) => item.name === geo.properties?.name)
          const isActive = zoomed && country?.name === activeCountry
          return <Geography key={geo.rsmKey ?? geo.id} geography={geo} onClick={country ? () => onSelect(country.name) : undefined} fill={country ? 'var(--accent-primary)' : '#e3e9f0'} fillOpacity={country ? (isActive ? 1 : 0.6) : 1} stroke="#ffffff" strokeWidth={0.6} vectorEffect="non-scaling-stroke" style={{ outline: 'none', cursor: country ? 'pointer' : 'default' }} />
        })}
      </Geographies>
    </g>
    {MAP_COUNTRIES.map((country, i) => {
      const isActive = zoomed && country.name === activeCountry
      // Sidebar buttons carry keyboard/screen-reader selection; the marker is a pointer shortcut.
      return <g key={country.name} ref={(el) => { markerRefs.current[i] = el }} transform={`translate(${points[i][0]} ${points[i][1]})`} aria-hidden="true" onClick={() => onSelect(country.name)} style={{ cursor: 'pointer' }}>
        <circle r={isActive ? 6.5 : 5} fill="var(--accent-primary)" stroke="#ffffff" strokeWidth={2.5} />
        <text x={12} y={4.5} fontSize={13} fontWeight={isActive ? 700 : 600} fill={isActive ? '#0f172a' : '#334155'} stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.01em' }}>{country.name}</text>
      </g>
    })}
  </>
}

export const MapSection = memo(function MapSection() {
  const ref = useRef<HTMLElement>(null)
  const [activeCountry, setActiveCountry] = useState('Egypt')
  const [zoomed, setZoomed] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  useRevealOnScroll(ref, { selector: '.map-reveal', y: 24, duration: 0.8, start: 'top 78%' })
  useEffect(() => setMapReady(true), [])
  const selectCountry = (countryName: string) => {
    setZoomed(true)
    setActiveCountry(countryName)
  }

  return <section ref={ref} id="map" className="py-12 md:py-20">
    <div className="section-container text-center">
      <p className="map-reveal mb-4 text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Where we operate</p>
      <h2 className="map-reveal mb-8 text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>A network with regional reach.</h2>
      <div className="map-reveal mx-auto grid max-w-5xl gap-6 text-left lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="map-canvas relative overflow-hidden">
          {mapReady ? <ComposableMap aria-label="World map showing Xanadu operations in Egypt, Oman, and Mauritius" projection="geoEqualEarth" projectionConfig={{ scale: 150, center: [20, 5] }} width={MAP_WIDTH} height={MAP_HEIGHT} className="block h-auto w-full">
            <MapLayers activeCountry={activeCountry} zoomed={zoomed} onSelect={selectCountry} />
          </ComposableMap> : <div aria-hidden="true" className="aspect-[800/430] w-full" />}
        </div>
        <aside aria-label="Countries Xanadu operates" className="flex flex-col gap-4 py-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Countries Xanadu operates</p>
          <div className="space-y-2">
            {MAP_COUNTRIES.map((country) => <button key={country.name} type="button" onClick={() => selectCountry(country.name)} aria-pressed={zoomed && country.name === activeCountry} className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors" style={{ color: 'var(--text-primary)', background: zoomed && country.name === activeCountry ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent' }}>
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: 'var(--accent-primary)', boxShadow: zoomed && country.name === activeCountry ? '0 0 0 4px rgba(var(--accent-primary-rgb), 0.14)' : undefined }} />
              <span><span className="block text-sm font-semibold">{country.name}</span><span className="block text-xs" style={{ color: 'var(--text-muted)' }}>{country.region}</span></span>
            </button>)}
          </div>
          {zoomed && <button type="button" onClick={() => setZoomed(false)} className="self-start rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--accent-primary)' }}>← World view</button>}
        </aside>
      </div>
    </div>
  </section>
})

export const NetworkSection = memo(function NetworkSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.net-reveal', duration: 0.9, stagger: 0.1, start: 'top 70%' })
  const benefits = [
    ['01', 'Direct access', 'Decision-makers who can move an idea forward.'],
    ['02', 'Faster deal flow', 'Warm introductions that shorten the distance between opportunity and action.'],
    ['03', 'Market intelligence', 'Local context and lived experience across sectors.'],
    ['04', 'Cross-border reach', 'A bridge between regional ambition and global capability.'],
  ]
  return <section ref={ref} id="network" className="relative overflow-hidden py-16 md:py-28">
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full opacity-70" style={{ background: 'radial-gradient(circle, rgba(61,90,128,0.14), rgba(61,90,128,0) 68%)' }} />
    <div className="section-container relative grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20">
      <div>
        <p className="net-reveal mb-5 text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--accent-primary)' }}>Our Network</p>
        <h2 className="net-reveal mb-6 max-w-xl text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl" style={{ fontFamily: 'var(--font-heading)' }}>The right connection changes the trajectory.</h2>
        <p className="net-reveal max-w-lg text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Xanadu operates inside a living network of founders, investors, operators, and decision-makers. We turn that proximity into momentum for the businesses we build and back.</p>
        <div className="net-reveal mt-10 flex items-center gap-4" style={{ color: 'var(--accent-primary)' }}>
          <span className="h-px w-14" style={{ background: 'currentColor' }} />
          <span className="text-xs font-semibold uppercase tracking-[0.22em]">Built for movement</span>
        </div>
      </div>
      <div className="net-reveal grid gap-3 sm:grid-cols-2">
        {benefits.map(([number, title, description]) => <div key={number} className="group relative overflow-hidden rounded-2xl border p-5 transition-transform duration-300 hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.68)', borderColor: 'rgba(61,90,128,0.14)', boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
          <div className="mb-8 flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.2em]" style={{ color: 'var(--accent-primary)' }}>{number}</span><span aria-hidden="true" className="text-2xl font-light transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--accent-primary)' }}>↗</span></div>
          <h3 className="mb-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>)}
      </div>
      <p className="net-reveal text-lg lg:col-span-2" style={{ color: 'var(--text-muted)' }}>Most companies build connections. <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>We activate networks.</span></p>
    </div>
  </section>
})
