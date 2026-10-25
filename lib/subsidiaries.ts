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
  logo?: string
  stealth?: boolean
}

/** One service on a subsidiary's detail page. */
export interface Service {
  title: string
  desc: string
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
  /** Services breakdown — detail page only. */
  services: Service[]
  /** Optional closing line under the services grid (track record, method). */
  servicesNote?: string
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
    services: [
      { title: 'Outsourced Sales & BD', desc: 'End-to-end sales support, pipeline management, and measurable ROI.' },
      { title: 'Market Launch', desc: 'Unlocking MENA opportunities for Egyptian companies expanding abroad and international companies entering Egypt.' },
      { title: 'Advisory', desc: 'Market and product development, fundraising and international growth, regulation and compliance.' },
    ],
    servicesNote:
      'All delivered through a proven 7-step methodology, from product onboarding to project management, with offices in Egypt, Oman, and Mauritius.',
    ctaText: 'Accelerate Your Growth',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      "Unlike traditional consulting firms, we don't just create strategies; we work alongside you to execute them — backed by 15+ years across MENA, a proven methodology, and a wide network spanning fintech, e-commerce, SaaS, and digital transformation. With offices in Egypt, Oman, and Mauritius, we bridge global ideas with MENA realities.",
    clients: [
      { name: 'Gem', logo: '/partners/consulting/Gem .PNG' },
      { name: 'Zilla Capital', logo: '/partners/consulting/Zilla capital.PNG' },
      { name: 'CIGP', logo: '/partners/consulting/cigp.png' },
      { name: 'El Shawarby', logo: '/partners/consulting/elshawarby.png' },
      { name: 'Handle EA', logo: '/partners/consulting/handle-ea.png' },
      { name: 'Lorax', logo: '/partners/consulting/lorax.png' },
      { name: 'Nexus', logo: '/partners/consulting/nexus.png' },
      { name: 'Novacap', logo: '/partners/consulting/novacap.png' },
      { name: 'RMP', logo: '/partners/consulting/rmp.png' },
      { name: 'Techknowledge', logo: '/partners/consulting/techknowledge.png' },
      { name: 'Track3 Consulting', logo: '/partners/consulting/track3.png' },
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
    services: [
      { title: 'Software Development', desc: 'Software development and outsourcing.' },
      { title: 'Odoo ERP', desc: 'Odoo ERP implementation as an official MENA partner.' },
      { title: 'Cloudbeds', desc: 'Property management systems for hospitality.' },
      { title: 'Clio', desc: 'Legal clinics management as an official MENA partner.' },
      { title: 'Creator & Influencer Management', desc: 'Creators and influencer management with Beacons.ai and Influencer Hero.' },
      { title: 'Cybersecurity', desc: 'Cybersecurity services.' },
    ],
    servicesNote:
      '1,000+ projects delivered across five MENA countries, with 95% client satisfaction.',
    ctaText: 'Upgrade Your Systems',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(70vw,840px)]',
    aboutText:
      'Our mission is to empower local businesses by enhancing their capabilities through innovative technologies tailored to regional needs. Our vision: to be the premier bridge between global technological innovation and local business success in the MENA region — driving digital transformation through strategic partnerships and localized expertise.',
    clientsNote:
      '1,000+ delivered projects across five MENA countries — serving hospitality, retail, manufacturing, logistics, legal, and distribution clients with 95% client satisfaction.',
    partners: [
      { name: 'Bibliovation', logo: '/partners/soft/Bibliovation.png' },
      { name: 'Asfaleia', logo: '/partners/soft/asfaleia.png' },
      { name: 'Clio', logo: '/partners/soft/clio.png' },
      { name: 'Cloudbeds', logo: '/partners/soft/cloudbeds.png' },
      { name: 'OriginCX', logo: '/partners/soft/origincx.png' },
      { name: 'Tremoloo', logo: '/partners/soft/tremoloo.png' },
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
    services: [
      { title: 'Commercial Partnerships', desc: 'Connecting brands with clubs, academies, athletes, and celebrities.' },
      { title: 'Player Representation', desc: 'Official player representation — from contract negotiations to endorsement deals.' },
      { title: 'Gaming & Esports', desc: 'Gaming and e-sports management.' },
      { title: 'DBR Advertising Technology', desc: 'Region-specific ads during live broadcasts across six regions.' },
      { title: 'Sports Tech', desc: 'Sports tech solutions.' },
      { title: 'Facility Management', desc: 'From football, padel, and tennis courts to gyms, CrossFit boxes, and clubhouses.' },
    ],
    servicesNote:
      'With access to the Big 5 football leagues and 40M+ followers across MENA.',
    ctaText: 'Start Your Sports Journey',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      'We redefine the future of sports marketing, management, and innovation — igniting brand power, elevating sports passion, and expanding global reach. Our differentiators: deep expertise in local market dynamics and global sports trends, end-to-end solutions for brands, clubs, and athletes, and exclusive partnerships with global sports organizations.',
    clientsNote:
      'Reaching 1.5+ billion sports fans worldwide through DBR broadcast technology — with 40M+ followers across the MENA region and access to all Big 5 football leagues.',
    partners: [
      { name: 'Connect Sports', logo: '/partners/sports/connect-sports.png' },
      { name: 'Entourage', logo: '/partners/sports/entourage.png' },
      { name: 'SMG', logo: '/partners/sports/smg.png' },
      { name: 'Ye Sports', logo: '/partners/sports/ye-sports.png' },
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
    services: [
      { title: 'Product Development', desc: 'Full product development from concept to launch.' },
      { title: 'Tech Development', desc: 'Complete tech development with proven scalability.' },
      { title: 'Business Development & Growth', desc: 'Strategic business development and growth support.' },
    ],
    servicesNote:
      'Powered by a 6-week venture building pipeline: idea, productization, design and architecture, development, marketing and GTM, launch, and CEO partnership. Idea to seed, sector-agnostic, Egypt-first — sharing economy, esports, fintech, e-commerce, and AI.',
    ctaText: 'Ready to Build Together',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      'Our approach combines three advantages: an AI-powered framework (rapid prototyping, MVP creation, and market launch), an experienced team with a proven track record of building, scaling, and exiting startups, and record-pace launch through a 6-week venture-building pipeline — idea, productization, design and architecture, development, marketing and GTM, launch, and CEO partnership. Focus: MENA region, sector-agnostic, idea to seed — Egypt-first.',
    clientsNote:
      'A growing portfolio of early-stage companies across the sharing economy, esports, fintech, e-commerce, and AI — built at 3x speed by combining human expertise with AI acceleration.',
    portfolio: [
      { name: 'SEK', tag: 'Sharing Economy', logo: '/investments/sek.png', desc: 'Self-governed, community-based marketplaces for renting items — solving trust and accessibility in the sharing economy. Product ready.' },
      { name: 'HERU', tag: 'Esports', logo: '/investments/heru.jpeg', desc: 'The esports arena for gamers, organizers, and sponsors across MENA — streamlining tournaments and building player communities. Product ready.' },
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
    services: [
      { title: 'Market Access', desc: 'Strategic market access and direct manufacturer-buyer connections.' },
      { title: 'International Distribution', desc: 'We handle international distribution to get products where they need to go.' },
      { title: 'Trade Positioning & Negotiation', desc: 'Trade positioning and negotiation to turn supply into real opportunity.' },
    ],
    ctaText: 'Explore Trade Opportunities',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
    aboutText:
      'We open the right doors through strategic market access and direct manufacturer-buyer connections — then handle international distribution, trade positioning, and negotiation so supply turns into real opportunity.',
    clientsNote:
      'Working with manufacturers and distributors across industrials, food and agri, and pharmaceuticals — from Egyptian factories to UK-licensed distributors serving Africa and the Middle East.',
    portfolio: [
      { name: 'Standard Electric', logo: '/partners/trading/standard_electric.png', desc: 'Egyptian industrial electrical accessories manufacturer since 1995. IEC & BS compliant switch systems.' },
      { name: 'Food Trip — Spuds', logo: '/partners/trading/food_trip.png', desc: 'Premium kettle-cooked chips from Egypt. 10+ flavors, distributed in 23 countries.' },
      { name: 'EPG Pharma', logo: '/partners/trading/epg_pharma.png', desc: 'UK-licensed pharmaceutical distributor serving Africa and the Middle East. GMP/MHRA compliant.' },
      { name: 'Rich Land', logo: '/partners/trading/rich_land.png', desc: 'Large-scale agri-food producer. 5000+ acres, ISO/FDA/BRC certified. Full private-label manufacturing.' },
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
    services: [
      { title: 'Sports Marketing', desc: 'DPR technology delivering region-specific overlays on live broadcasts with 37% higher brand recall, plus club sponsorships and athlete endorsements that bypass ad bans.' },
      { title: 'UX/UI Design', desc: 'Audits, user research, usability testing, and AI prototyping from 30+ designers with engineering backgrounds.' },
      { title: 'Omnichannel Customer Experience', desc: 'Across Zendesk, Infobip, MoEngage, and more.' },
      { title: 'Cybersecurity & Compliance', desc: 'Smart contract audits, pentesting, red teaming, and MiCA/VARA advisory.' },
    ],
    ctaText: 'Build Your Web3 Brand',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(96vw,1040px)]',
    aboutText:
      "Crypto's growth challenge is hyper-saturation: 10,000+ assets competing for the same mindshare, major ad platforms restricting crypto advertising, and 73% of potential holders citing lack of trust as their #1 barrier. We built the answer as one integrated growth engine — Awareness (sports marketing) → Adoption (elite UX/UI) → Retention (omnichannel CX) → Trust (security and compliance) — combining deep MENA expertise, global reach, and a 100% crypto-native team.",
    clientsNote:
      '168+ global customers served by our design organization alone — alongside crypto-native teams, exchanges, and protocols across MENA and beyond.',
    partners: [
      { name: 'Cede Hub', logo: '/partners/web3/cede-hub.png' },
      { name: 'Flow Traders', logo: '/partners/web3/flowtraders.png' },
      { name: 'Overchain', logo: '/partners/web3/overchain.png' },
      { name: 'PToken', logo: '/partners/web3/ptoken.png' },
      { name: 'Semoto', logo: '/partners/web3/semoto.png' },
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
