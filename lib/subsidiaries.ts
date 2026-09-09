/**
 * Canonical source of truth for Xanadu's six subsidiaries.
 *
 * Order is load-bearing: it must stay `consulting, soft, sports, ventures,
 * trading, xw3` to preserve the subsidiary section order. The Web3 subsidiary displays
 * as `Web3` but its id / logo path remain `xw3`.
 *
 * Consumers: the six home section components, the home +
 * `/subsidiaries/[slug]` detail routes, `ScrollProgress.SECTIONS`, and
 * `app/sitemap.ts`.
 */

export interface PortfolioItem {
  name: string
  tag?: string
  desc: string
  stealth?: boolean
}

/** Detail-page client/partner chip — logo if an asset exists, text otherwise. */
export interface LogoEntry {
  name: string
  /** Path under /public (e.g. '/partners/odoo.png'). */
  logo?: string
}

export interface Subsidiary {
  id: string
  /** Display name (note: 'Web3' for the xw3 subsidiary). */
  name: string
  color: string
  logo: string
  hookText: string
  /** One-liner shown on the home page (summary-only scroll journey). */
  summaryText: string
  /** Full description — detail page only. */
  description: string
  /** Full services breakdown — detail page only. */
  servicesText: string
  ctaText: string
  /** Override the content column's width/position classes. */
  contentClassName?: string
  /** Optional portfolio grid (ventures + trading). */
  portfolio?: PortfolioItem[]
  /** Detail page: extra "About Us" paragraph beyond `description` (from the
   *  subsidiary's company profile). */
  aboutText?: string
  /** Detail page: named clients (logo chip if available). */
  clients?: LogoEntry[]
  /** Detail page: fallback line for the Clients block when no client is
   *  nameable in the profile (e.g. a reach stat instead of logos). */
  clientsNote?: string
  /** Detail page: partners / alliances (logo chip if available). */
  partners?: LogoEntry[]
}

export const SUBSIDIARIES: Subsidiary[] = [
  {
    id: 'consulting',
    name: 'Consulting',
    color: '#28D75A',
    logo: '/brand/new brand updated/colors with names/new/white xanadu_consulting_logos-02 1.png',
    hookText: "We don't just strategize. We execute.",
    summaryText:
      'An executional consulting boutique for tech startups and service companies across MENA — acting as your outsourced Sales & Business Development team.',
    description:
      'An executional consulting boutique for technology startups and service companies across MENA — we act as your Sales and Business Development team, with full accountability and clear deliverables.',
    servicesText:
      'Outsourced Sales & BD — end-to-end sales support, pipeline management, and measurable ROI. Market Launch — unlocking MENA opportunities for Egyptian companies expanding abroad and international companies entering Egypt. Advisory — market and product development, fundraising and international growth, regulation and compliance. All delivered through a proven 7-step methodology, from product onboarding to project management, with offices in Egypt, Oman, and Mauritius.',
    ctaText: 'Accelerate Your Growth',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      "Unlike traditional consulting firms, we don't just create strategies; we work alongside you to execute them — backed by 15+ years across MENA, a proven methodology, and a wide network spanning fintech, e-commerce, SaaS, and digital transformation. With offices in Egypt, Oman, and Mauritius, we bridge global ideas with MENA realities.",
    clients: [
      { name: 'Winfi', logo: '/partners/winfi.png' },
      { name: 'Bricks', logo: '/partners/bricks.png' },
      { name: 'Tremoloo', logo: '/partners/tremoloo.png' },
      { name: 'Asfaleia', logo: '/partners/asfaleia.png' },
      { name: 'Taager', logo: '/partners/taager.png' },
      { name: 'Nabda', logo: '/partners/nabda.png' },
      { name: 'Contrato', logo: '/partners/contrato.png' },
      { name: 'Al Zamil' },
      { name: 'Bekiaa', logo: '/partners/bekiaa.png' },
    ],
  },
  {
    id: 'soft',
    name: 'Soft',
    color: '#4176FA',
    logo: '/brand/new brand updated/colors with names/new/white xanadu_soft_logos-04 1.png',
    hookText: 'Technology as a bridge, not a barrier.',
    summaryText:
      'A leading systems integrator bringing international technology to MENA businesses — from hospitality and retail to logistics and legal.',
    description:
      'A leading systems integrator bringing cutting-edge international technology solutions to the MENA region — empowering local businesses through innovation tailored to regional needs, from hospitality and retail to logistics and legal.',
    servicesText:
      'Software development and outsourcing, Odoo ERP implementation, Cloudbeds property management systems, Clio legal clinics management, creators and influencer management with Beacons.ai and Influencer Hero, and cybersecurity services. Official MENA partner of Odoo and Clio — with 1,000+ projects delivered across five MENA countries and 95% client satisfaction.',
    ctaText: 'Upgrade Your Systems',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(70vw,840px)]',
    aboutText:
      'Our mission is to empower local businesses by enhancing their capabilities through innovative technologies tailored to regional needs. Our vision: to be the premier bridge between global technological innovation and local business success in the MENA region — driving digital transformation through strategic partnerships and localized expertise.',
    clientsNote:
      '1,000+ delivered projects across five MENA countries — serving hospitality, retail, manufacturing, logistics, legal, and distribution clients with 95% client satisfaction.',
    partners: [
      { name: 'Odoo', logo: '/partners/odoo.png' },
      { name: 'Clio', logo: '/partners/clio.png' },
      { name: 'Cloudbeds', logo: '/partners/cloudbeds.png' },
      { name: 'Beacons.ai', logo: '/partners/beacons.png' },
      { name: 'Influencer Hero' },
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    color: '#FF4E33',
    logo: '/brand/new brand updated/colors with names/new/white xanadu_sport_logos-01 1.png',
    hookText: '1.5 billion fans. One universal language.',
    summaryText:
      'A sports consulting boutique spanning sponsorship, events, athlete representation, and youth development — connecting brands, athletes, and fans.',
    description:
      'A leading sports consulting boutique specializing in sports sponsorship, event management, athlete representation, and youth development — bridging brands, athletes, and local markets to create unique, impactful experiences across the sports ecosystem.',
    servicesText:
      'Sports commercial partnerships connecting brands with clubs, academies, athletes, and celebrities. Official player representation — from contract negotiations to endorsement deals. Gaming and e-sports management. DBR advertising technology delivering region-specific ads during live broadcasts across six regions. Sports tech solutions. And world-class facility management — from football, padel, and tennis courts to gyms, CrossFit boxes, and clubhouses. With access to the Big 5 football leagues and 40M+ followers across MENA.',
    ctaText: 'Start Your Sports Journey',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      'We redefine the future of sports marketing, management, and innovation — igniting brand power, elevating sports passion, and expanding global reach. Our differentiators: deep expertise in local market dynamics and global sports trends, end-to-end solutions for brands, clubs, and athletes, and exclusive partnerships with global sports organizations.',
    clientsNote:
      'Reaching 1.5+ billion sports fans worldwide through DBR broadcast technology — with 40M+ followers across the MENA region and access to all Big 5 football leagues.',
    partners: [
      { name: 'Premier League' },
      { name: 'La Liga' },
      { name: 'Serie A' },
      { name: 'Bundesliga' },
      { name: 'Ligue 1' },
    ],
  },
  {
    id: 'ventures',
    name: 'Ventures',
    color: '#FFD21F',
    logo: '/brand/new brand updated/colors with names/new/white xanadu_ventures_logos-03 3.png',
    hookText: "Building tomorrow's startups today.",
    summaryText:
      'An AI-powered venture studio taking early-stage ideas from validation to launch and fundraising.',
    description:
      'An AI-powered early-stage venture studio offering a complete ecosystem for early-stage startups across MENA. From market validation to scaling and fundraising, we help entrepreneurs turn groundbreaking ideas into sustainable businesses.',
    servicesText:
      'Full product development from concept to launch, complete tech development with proven scalability, and strategic business development and growth support — powered by a 6-week venture building pipeline: idea, productization, design and architecture, development, marketing and GTM, launch, and CEO partnership. Idea to seed, sector-agnostic, Egypt-first — sharing economy, esports, fintech, PropTech, e-commerce, and AI.',
    ctaText: 'Ready to Build Together',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      'Our approach combines three advantages: an AI-powered framework (rapid prototyping, MVP creation, and market launch), an experienced team with a proven track record of building, scaling, and exiting startups, and record-pace launch through a 6-week venture-building pipeline — idea, productization, design and architecture, development, marketing and GTM, launch, and CEO partnership. Focus: MENA region, sector-agnostic, idea to seed — Egypt-first.',
    clientsNote:
      'A growing portfolio of early-stage companies across the sharing economy, esports, fintech, PropTech, e-commerce, and AI — built at 3x speed by combining human expertise with AI acceleration.',
    portfolio: [
      { name: 'SEK', tag: 'Sharing Economy', desc: 'Self-governed, community-based marketplaces for renting items — solving trust and accessibility in the sharing economy. Product ready.' },
      { name: 'HERU', tag: 'Esports', desc: 'The esports arena for gamers, organizers, and sponsors across MENA — streamlining tournaments and building player communities. Product ready.' },
      { name: 'BillBot', tag: 'Fintech / AI', desc: 'An AI-powered WhatsApp bot that helps users effortlessly track, manage, and pay all their bills in one place.', stealth: true },
      { name: 'TRUSS', tag: 'PropTech / Blockchain', desc: 'Real estate investment through blockchain tokenization — fractional ownership of premium properties.', stealth: true },
      { name: 'Crypto Exchange', tag: 'Crypto / Fintech', desc: "Egypt's first compliant, regulated cryptocurrency exchange platform.", stealth: true },
      { name: 'Local Brands Platform', tag: 'E-Commerce', desc: "A unified online marketplace connecting Egypt's emerging local brands with customers.", stealth: true },
    ],
  },
  {
    id: 'trading',
    name: 'Trading',
    color: '#4D7CFF',
    logo: '/brand/new brand updated/colors with names/new/trading logo.png',
    hookText: "Access. Positioning. Networks. That's what opens doors.",
    summaryText:
      'We connect manufacturers, distributors, and global buyers — turning supply into real opportunity.',
    description:
      'Businesses miss opportunities from a lack of access, positioning, or networks. We connect manufacturers, distributors, and global buyers to turn supply into real opportunity.',
    servicesText:
      'We open the right doors through strategic market access and direct manufacturer-buyer connections. We then handle international distribution, trade positioning, and negotiation to turn supply into real opportunity.',
    ctaText: 'Explore Trade Opportunities',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      'We open the right doors through strategic market access and direct manufacturer-buyer connections — then handle international distribution, trade positioning, and negotiation so supply turns into real opportunity.',
    clientsNote:
      'Working with manufacturers and distributors across industrials, food and agri, and pharmaceuticals — from Egyptian factories to UK-licensed distributors serving Africa and the Middle East.',
    portfolio: [
      { name: 'Standard Electric', desc: 'Egyptian industrial electrical accessories manufacturer since 1995. IEC & BS compliant switch systems.' },
      { name: 'Food Trip — Spuds', desc: 'Premium kettle-cooked chips from Egypt. 10+ flavors, distributed in 23 countries.' },
      { name: 'EPG Pharma', desc: 'UK-licensed pharmaceutical distributor serving Africa and the Middle East. GMP/MHRA compliant.' },
      { name: 'Rich Land', desc: 'Large-scale agri-food producer. 5000+ acres, ISO/FDA/BRC certified. Full private-label manufacturing.' },
    ],
  },
  {
    id: 'xw3',
    name: 'Web3',
    color: '#9344DE',
    logo: '/brand/new brand updated/colors with names/new/web 3 logo.png',
    hookText: 'In Web3, trust is everything.',
    summaryText:
      'The complete Web3 growth partner — taking crypto brands from awareness to adoption and trust.',
    description:
      'The complete Web3 growth partner. We take crypto brands from awareness to adoption, retention, and trust — combining deep MENA expertise, global reach, and a 100% crypto-native team.',
    servicesText:
      'Sports marketing — DPR technology delivering region-specific overlays on live broadcasts with 37% higher brand recall, plus club sponsorships and athlete endorsements that bypass ad bans. Elite UX/UI design — audits, user research, usability testing, and AI prototyping from 30+ designers with engineering backgrounds. Omnichannel customer experience across Zendesk, Infobip, MoEngage, and more. And cybersecurity and compliance — smart contract audits, pentesting, red teaming, and MiCA/VARA advisory.',
    ctaText: 'Build Your Web3 Brand',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(96vw,1040px)]',
    aboutText:
      "Crypto's growth challenge is hyper-saturation: 10,000+ assets competing for the same mindshare, major ad platforms restricting crypto advertising, and 73% of potential holders citing lack of trust as their #1 barrier. We built the answer as one integrated growth engine — Awareness (sports marketing) → Adoption (elite UX/UI) → Retention (omnichannel CX) → Trust (security and compliance) — combining deep MENA expertise, global reach, and a 100% crypto-native team.",
    clientsNote:
      '168+ global customers served by our design organization alone — alongside crypto-native teams, exchanges, and protocols across MENA and beyond.',
    partners: [
      { name: 'Zendesk', logo: '/partners/zendesk.png' },
      { name: 'Infobip', logo: '/partners/infobip.png' },
      { name: 'MoEngage' },
      { name: 'Gameball', logo: '/partners/gameball.png' },
      { name: 'Bird' },
      { name: 'Truecaller' },
      { name: '3CX' },
    ],
  },
]

export const getSubsidiary = (id: string): Subsidiary | undefined =>
  SUBSIDIARIES.find((s) => s.id === id)

export const SUBSIDIARY_IDS = SUBSIDIARIES.map((s) => s.id)

/** Client-facing routing name the contact flow uses on the wire
 *  ('Xanadu Consulting', 'Xanadu Soft', …; the Web3 subsidiary displays
 *  bare). Single source for contactConfig's ROUTING divisions and the API
 *  route's KNOWN_DIVISIONS allow-list — both must be DERIVED from this,
 *  never re-hardcoded, or a rename here silently 400s the contact form. */
export const divisionName = (s: Subsidiary): string =>
  s.id === 'xw3' ? s.name : `Xanadu ${s.name}`
