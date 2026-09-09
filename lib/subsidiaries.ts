/**
 * Canonical source of truth for Xanadu's six subsidiaries.
 *
 * Order is load-bearing: it must stay `consulting, soft, sports, ventures,
 * trading, xw3` to preserve the `edge i ↔ arm i ↔ section id` coupling used by
 * the BrandMarkAssembly finale (see AGENTS.md). The Web3 subsidiary displays
 * as `Web3` but its id / logo path remain `xw3`.
 *
 * Consumers: the six `components/sections/*.tsx`, the home +
 * `/subsidiaries/[slug]` detail routes, `BrandMarkAssembly.tsx` (`LAYERS`),
 * `ScrollProgress.SECTIONS`, and `app/sitemap.ts`.
 */

export interface PortfolioItem {
  name: string
  tag?: string
  desc: string
  stealth?: boolean
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
}

export const SUBSIDIARIES: Subsidiary[] = [
  {
    id: 'consulting',
    name: 'Consulting',
    color: '#28D75A',
    logo: '/logos/consulting.png',
    hookText: "We don't just strategize. We execute.",
    summaryText:
      'An executional consulting boutique for tech startups and service companies across MENA — acting as your outsourced Sales & Business Development team.',
    description:
      'An executional consultation boutique for technology startups and service companies across MENA — we act as your Sales and Business Development team, with full accountability and clear deliverables.',
    servicesText:
      'Outsourced Sales & BD — end-to-end sales support, pipeline management, and measurable ROI. Market Launch — unlocking MENA opportunities for Egyptian companies expanding abroad and international companies entering Egypt. Advisory — market and product development, fundraising and international growth, regulation and compliance. All delivered through a proven 7-step methodology, from product onboarding to project management, with offices in Egypt, Oman, and Mauritius.',
    ctaText: 'Accelerate Your Growth',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
  },
  {
    id: 'soft',
    name: 'Soft',
    color: '#4176FA',
    logo: '/logos/soft.png',
    hookText: 'Technology as a bridge, not a barrier.',
    summaryText:
      'A leading systems integrator bringing international technology to MENA businesses — from hospitality and retail to logistics and legal.',
    description:
      'A leading systems integrator bringing cutting-edge international technology solutions to the MENA region — empowering local businesses through innovation tailored to regional needs, from hospitality and retail to logistics and legal.',
    servicesText:
      'Software development and outsourcing, Odoo ERP implementation, Cloudbeds property management systems, Clio legal clinics management, creators and influencer management with Beacons.ai and Influencer Hero, and cybersecurity services. Official MENA partner of Odoo and Clio — with 1,000+ projects delivered across five MENA countries and 95% client satisfaction.',
    ctaText: 'Upgrade Your Systems',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(70vw,840px)]',
  },
  {
    id: 'sports',
    name: 'Sports',
    color: '#FF4E33',
    logo: '/logos/sports.png',
    hookText: '1.5 billion fans. One universal language.',
    summaryText:
      'A sports consulting boutique spanning sponsorship, events, athlete representation, and youth development — connecting brands, athletes, and fans.',
    description:
      'A leading sports consulting boutique specializing in sports sponsorship, event management, athlete representation, and youth development — bridging brands, athletes, and local markets to create unique, impactful experiences across the sports ecosystem.',
    servicesText:
      'Sports commercial partnerships connecting brands with clubs, academies, athletes, and celebrities. Official player representation — from contract negotiations to endorsement deals. Gaming and e-sports management. DBR advertising technology delivering region-specific ads during live broadcasts across six regions. Sports tech solutions. And world-class facility management — from football, padel, and tennis courts to gyms, CrossFit boxes, and clubhouses. With access to the Big 5 football leagues and 40M+ followers across MENA.',
    ctaText: 'Start Your Sports Journey',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
  },
  {
    id: 'ventures',
    name: 'Ventures',
    color: '#FFD21F',
    logo: '/logos/ventures.png',
    hookText: "Building tomorrow's startups today.",
    summaryText:
      'An AI-powered venture studio taking early-stage ideas from validation to launch and fundraising.',
    description:
      'An AI-powered early-stage venture studio offering a complete ecosystem for early-stage startups across MENA. From market validation to scaling and fundraising, we help entrepreneurs turn groundbreaking ideas into sustainable businesses.',
    servicesText:
      'Full product development from concept to launch, complete tech development with proven scalability, and strategic business development and growth support — powered by a 6-week venture building pipeline: idea, productization, design and architecture, development, marketing and GTM, launch, and CEO partnership. Idea to seed, sector-agnostic, Egypt-first — sharing economy, esports, fintech, PropTech, e-commerce, and AI.',
    ctaText: 'Ready to Build Together',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
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
    logo: '/logos/trading.png',
    hookText: "Access. Positioning. Networks. That's what opens doors.",
    summaryText:
      'We connect manufacturers, distributors, and global buyers — turning supply into real opportunity.',
    description:
      'Businesses miss opportunities from a lack of access, positioning, or networks. We connect manufacturers, distributors, and global buyers to turn supply into real opportunity.',
    servicesText:
      'We open the right doors through strategic market access and direct manufacturer-buyer connections. We then handle international distribution, trade positioning, and negotiation to turn supply into real opportunity.',
    ctaText: 'Explore Trade Opportunities',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(80vw,920px)]',
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
    logo: '/logos/xw3.png',
    hookText: 'In Web3, trust is everything.',
    summaryText:
      'The complete Web3 growth partner — taking crypto brands from awareness to adoption and trust.',
    description:
      'The complete Web3 growth partner. We take crypto brands from awareness to adoption, retention, and trust — combining deep MENA expertise, global reach, and a 100% crypto-native team.',
    servicesText:
      'Sports marketing — DPR technology delivering region-specific overlays on live broadcasts with 37% higher brand recall, plus club sponsorships and athlete endorsements that bypass ad bans. Elite UX/UI design — audits, user research, usability testing, and AI prototyping from 30+ designers with engineering backgrounds. Omnichannel customer experience across Zendesk, Infobip, MoEngage, and more. And cybersecurity and compliance — smart contract audits, pentesting, red teaming, and MiCA/VARA advisory.',
    ctaText: 'Build Your Web3 Brand',
    contentClassName: 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(96vw,1040px)]',
  },
]

export const getSubsidiary = (id: string): Subsidiary | undefined =>
  SUBSIDIARIES.find((s) => s.id === id)

export const SUBSIDIARY_IDS = SUBSIDIARIES.map((s) => s.id)
