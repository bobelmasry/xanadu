/**
 * Canonical source of truth for Xanadu's investment portfolio companies.
 *
 * Shared by the home-page Investments section (summary variant) and the
 * `/investments` detail page (full variant).
 */

export interface CaseStudy {
  subject: string
  challenge: string
  solution: string
  result: string
}

export interface Investment {
  name: string
  overview: string
  services: string[]
  value: string
  caseStudy?: CaseStudy
}

export const INVESTMENTS: Investment[] = [
  {
    name: 'Origin CX',
    overview: "MENA's first end-to-end, tech-enabled customer experience consultancy.",
    services: ['Omnichannel CX design', 'Real-time support systems', 'CX automation'],
    value: 'Exclusive regional partner of Zendesk, with integrations across SAP Emarsus, Infobip, Gameball.',
    caseStudy: {
      subject: 'Digital Service Provider',
      challenge: 'Poor customer experience across multiple channels.',
      solution: 'Implemented an omnichannel CX system + automation tools.',
      result: 'Improved customer satisfaction and conversion rates.',
    },
  },
  {
    name: 'Foras Fen',
    overview: 'A business discovery platform sharing opportunities, market insights, and emerging trends.',
    services: ['Curate business opportunities', 'Market insights & news', 'Emerging sector highlights'],
    value: 'Acts as an opportunity engine — giving access to deals before they become widely visible.',
    caseStudy: {
      subject: 'Early-stage opportunity discovery',
      challenge: 'Limited access to market insights.',
      solution: 'Leveraged curated opportunities and insights.',
      result: 'Faster decision-making and opportunity access.',
    },
  },
  {
    name: 'Qualiphi',
    overview: "MEA's first AI-powered career services platform connecting students, universities, and employers.",
    services: ['AI-powered job matching', 'Career development tools', 'University career management'],
    value: 'Access to 500,000+ students and graduates across 40+ universities.',
    caseStudy: {
      subject: 'University Career Center',
      challenge: 'Inefficient career tracking and employer connection.',
      solution: 'Implemented the Qualiphi platform.',
      result: 'Improved student placement and employer engagement.',
    },
  },
  {
    name: 'Hatoon Industries',
    overview: 'A leading Egyptian company in personal care and health via direct selling and digital commerce.',
    services: ['Health products', 'Direct selling networks', 'E-commerce distribution'],
    value: 'Strong regional presence with scalable network-driven growth model.',
    caseStudy: {
      subject: 'Egypt market',
      challenge: 'Expanding customer base efficiently.',
      solution: 'Leveraged direct selling + digital channels.',
      result: 'Scalable growth and strong brand presence.',
    },
  },
  {
    name: 'Derma Egypt',
    overview: 'A leading medical conference focused on dermatology under the Egyptian Medical Association.',
    services: ['Medical conferences', 'Industry knowledge exchange', 'Professional networking'],
    value: 'Positioned at the center of medical knowledge and professional engagement in dermatology.',
    caseStudy: {
      subject: 'Annual Dermatology Conference',
      challenge: 'Industry knowledge gaps and limited collaboration.',
      solution: 'Organized a large-scale medical conference.',
      result: 'Increased professional engagement and knowledge sharing.',
    },
  },
  {
    name: 'Ukaz',
    overview: "A discovery-based e-commerce platform where users explore products they didn't know they needed.",
    services: ['Curated product discovery', 'Trend-driven e-commerce', 'Scroll-based shopping'],
    value: 'Built for Gen Z behavior — fast, engaging, and driven by discovery rather than search.',
    caseStudy: {
      subject: 'Gen Z shoppers',
      challenge: 'Low engagement with traditional e-commerce.',
      solution: 'Created a scroll-based discovery experience.',
      result: 'Higher engagement and impulse-driven purchases.',
    },
  },
]
