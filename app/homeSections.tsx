"use client"

import React, { memo, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SubsidiarySection from '../components/SubsidiarySection'
import PortfolioGrid from '../components/PortfolioGrid'
import { getSubsidiary } from '../lib/subsidiaries'
import { INVESTMENTS } from '../lib/investments'
import { useRevealOnScroll } from '../lib/useRevealOnScroll'

export type SectionProps = { onContactClick?: () => void; variant?: 'summary' | 'full' }

export const AboutSection = memo(function AboutSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.about-reveal', duration: 1, stagger: 0.15, start: 'top 70%' })
  return <section ref={ref} id="about" className="relative py-14 md:py-28"><div className="section-container max-w-3xl mx-auto text-center">
    <p className="about-reveal text-sm uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--text-muted)' }}>About Us</p>
    <h2 className="about-reveal text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Who are we? <span className="text-gradient">Global vision, local execution.</span></h2>
    <p className="about-reveal text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>A multi-disciplinary business group founded and led by Hessain Al Menawy, continuing a legacy of entrepreneurship and innovation in the MENA region — building and scaling businesses across emerging sectors through a business development lens.</p>
    <p className="about-reveal text-base leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>We bring international thinking and digital-first strategies to local opportunities, operating at the intersection of traditional industries and digital transformation — with offices across Egypt, Oman, and Mauritius.</p>
    <div className="about-reveal grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">{[{ value: '15+ Years', label: 'Trusted expertise in MENA' }, { value: '1,000+ Projects', label: 'Excellence across industries' }, { value: '3 Countries', label: 'Egypt, Oman, Mauritius' }].map((stat) => <div key={stat.value} className="glass-card p-5"><p className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</p><p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p></div>)}</div>
  </div></section>
})

export const SubsidiariesIntroSection = memo(function SubsidiariesIntroSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.subs-reveal', duration: 1, stagger: 0.15, start: 'top 70%' })
  return <section ref={ref} id="our-subsidiaries" className="relative py-8 md:py-20"><div className="section-container max-w-3xl mx-auto text-center">
    <p className="subs-reveal text-sm uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--text-muted)' }}>Our Subsidiaries</p>
    <h2 className="subs-reveal text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Six specialized companies. <span className="text-gradient">One continuous system.</span></h2>
    <p className="subs-reveal text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Each subsidiary operates independently — and each one feeds the others. Explore how the Xanadu companies work together.</p>
  </div></section>
})

function SubsidiaryHomeSection({ id, onContactClick, variant }: SectionProps & { id: string }) {
  return <SubsidiarySection {...getSubsidiary(id)!} variant={variant} onCtaClick={onContactClick} />
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

export const VenturesSection = memo(function VenturesSection({ onContactClick, variant }: SectionProps) {
  const { portfolio, ...subsidiary } = getSubsidiary('ventures')!
  return <SubsidiarySection {...subsidiary} variant={variant} onCtaClick={onContactClick}>{portfolio && <><PortfolioGrid items={portfolio} accent={subsidiary.color} variant="tagged" /><div className="mt-8"><p className="text-xs uppercase tracking-[0.25em] mb-5" style={{ color: 'var(--text-muted)' }}>The Xanadu Advantage</p><div className="space-y-2"><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI-Powered Framework — accelerating development with rapid prototyping and MVP creation.</p><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Robust Network — access to entrepreneurs, investors, and industry experts.</p><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Proven Experience — a team that has built, scaled, and successfully exited startups.</p><p className="text-sm font-medium" style={{ color: subsidiary.color }}>Human expertise + AI acceleration = 3x faster venture building.</p></div></div></>}</SubsidiarySection>
})

export const TradingSection = memo(function TradingSection({ onContactClick, variant }: SectionProps) {
  const { portfolio, ...subsidiary } = getSubsidiary('trading')!
  return <SubsidiarySection {...subsidiary} variant={variant} onCtaClick={onContactClick}>{portfolio && <PortfolioGrid items={portfolio} accent={subsidiary.color} heading="Our Portfolio" />}</SubsidiarySection>
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
    {variant === 'full' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{INVESTMENTS.map((inv, i) => <div key={inv.name} className="inv-reveal glass-card p-6" style={{ borderColor: expanded === i ? `${GOLD}55` : undefined }}><h3 className="m-0 mb-2"><button type="button" aria-expanded={expanded === i} onClick={() => setExpanded(expanded === i ? null : i)} className="w-full text-left text-lg font-semibold" style={{ color: GOLD }}>✧ {inv.name}</button></h3><p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{inv.overview}</p>{expanded === i && <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}><div className="flex flex-wrap gap-2 mb-3">{inv.services.map((service) => <span key={service} className="text-xs px-2 py-1 rounded-full" style={{ background: `${GOLD}15`, color: GOLD }}>{service}</span>)}</div><p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{inv.value}</p></div>}</div>)}</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">{INVESTMENTS.map((inv) => <div key={inv.name} className="inv-reveal glass-card p-6"><h3 className="text-lg font-semibold mb-2" style={{ color: GOLD }}>✧ {inv.name}</h3><p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>{inv.overview}</p></div>)}</div>}
    {variant === 'summary' && <Link href="/investments" className="inv-reveal inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}40`, color: GOLD }}>Learn more <span aria-hidden="true">→</span></Link>}
  </div></section>
})

const PARTNERS = [{ name: 'SMG', logo: '/partners/smg.png' }, { name: 'Entourage', logo: '/partners/entourage.png' }, { name: 'Ye Sports', logo: '/partners/ye-sports.png' }, { name: 'Winfi', logo: '/partners/winfi.png' }, { name: 'Bricks', logo: '/partners/bricks.png' }, { name: 'Tremoloo', logo: '/partners/tremoloo.png' }, { name: 'Odoo', logo: '/partners/odoo.png' }, { name: 'Clio', logo: '/partners/clio.png' }, { name: 'Cloudbeds', logo: '/partners/cloudbeds.png' }, { name: 'Asfaleia', logo: '/partners/asfaleia.png' }, { name: 'Taager', logo: '/partners/taager.png' }, { name: 'Nabda', logo: '/partners/nabda.png' }, { name: 'Influencer Hero' }, { name: 'Beacons.ai', logo: '/partners/beacons.png' }, { name: 'El Shawaraby' }, { name: 'Contrato', logo: '/partners/contrato.png' }, { name: 'Al Zamil' }, { name: 'Bekiaa', logo: '/partners/bekia.png' }, { name: 'Zendesk', logo: '/partners/zendesk.png' }, { name: 'Infobip', logo: '/partners/infobip.png' }, { name: 'Gameball', logo: '/partners/gameball.png' }]
export const PartnersSection = memo(function PartnersSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.partner-reveal', y: 30, duration: 0.8, stagger: 0.06, start: 'top 75%' })
  return <section ref={ref} id="partners" className="py-14 md:py-28"><div className="section-container text-center"><p className="partner-reveal text-sm uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>Partners</p><h2 className="partner-reveal text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>We don&apos;t grow alone.</h2><p className="partner-reveal text-xl mb-4" style={{ color: 'var(--text-secondary)' }}>We grow through strategic alignment.</p><p className="partner-reveal text-base mb-10 mx-auto" style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>Xanadu Group has established strong strategic collaborations with global industry leaders and serves some of the most prominent organizations in the MENA region.</p><div className="partner-reveal grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-10 max-w-4xl mx-auto">{PARTNERS.map((partner) => <div key={partner.name} className="flex items-center justify-center">{partner.logo ? <img src={partner.logo} alt={partner.name} loading="lazy" className="h-11 md:h-12 w-auto max-w-full object-contain" /> : <span className="text-sm font-semibold tracking-wide px-4 py-2 rounded-lg" style={{ color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.1)' }}>{partner.name}</span>}</div>)}</div><p className="partner-reveal text-lg italic" style={{ color: 'var(--text-muted)' }}>Driving innovation and growth through <span style={{ color: 'var(--text-primary)' }}>powerful collaborations</span>.</p></div></section>
})

export const NetworkSection = memo(function NetworkSection() {
  const ref = useRef<HTMLElement>(null)
  useRevealOnScroll(ref, { selector: '.net-reveal' })
  const benefits = ['Direct access to decision-makers', 'Faster partnerships and deal flow', 'Insider market knowledge', 'Cross-border opportunities']
  return <section ref={ref} id="network" className="py-14 md:py-28"><div className="section-container max-w-3xl mx-auto text-center"><p className="net-reveal text-sm uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>Our Network</p><h2 className="net-reveal text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Access changes everything.</h2><p className="net-reveal text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Xanadu operates within a powerful regional and global network of founders, investors, operators, and decision-makers. This network is actively leveraged to unlock opportunities and accelerate deals.</p><div className="net-reveal grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">{benefits.map((benefit) => <div key={benefit} className="glass-card p-5 flex items-center gap-4"><span className="text-xl" style={{ color: '#3D5A80' }}>⟡</span><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{benefit}</span></div>)}</div><p className="net-reveal text-lg" style={{ color: 'var(--text-muted)' }}>Most companies build connections. <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>We activate networks.</span></p></div></section>
})
