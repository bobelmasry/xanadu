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
  logo?: string
  /** Company website, or its LinkedIn page when there is no working site. */
  url?: string
  /** Link text when `url` is neither a website nor LinkedIn (e.g. a press release). */
  urlLabel?: string
  overview: string
  services?: string[]
  value?: string
  caseStudy?: CaseStudy
}

export const INVESTMENTS: Investment[] = [
  {
    name: 'Origin CX',
    logo: '/investments/origincx.png',
    url: 'https://www.linkedin.com/company/origincx',
    overview: "MENA's first end-to-end, tech-enabled customer experience consultancy.",
    services: ['Omnichannel CX design', 'Real-time support systems', 'CX automation'],
    value: 'Exclusive regional partner of Zendesk, with integrations across SAP Emarsys, Infobip, Gameball.',
    caseStudy: {
      subject: 'Digital Service Provider',
      challenge: 'Poor customer experience across multiple channels.',
      solution: 'Implemented an omnichannel CX system + automation tools.',
      result: 'Improved customer satisfaction and conversion rates.',
    },
  },
  {
    name: 'Foras Fen',
    logo: '/investments/El Foras Fain.png',
    url: 'https://www.zawya.com/en/press-release/events-and-conferences/stem-entrepreneurship-center-platform-powers-al-foras-fein-q7s98ajb',
    urlLabel: 'Press release',
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
    logo: '/investments/qualiphi.png',
    url: 'https://qualiphi.ai',
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
    logo: '/investments/hatoon.png',
    url: 'https://www.linkedin.com/company/hatoonindustries',
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
    name: 'Ukaz',
    logo: '/investments/ukaz.png',
    url: 'https://ukaz.shop',
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
  {
    name: 'HERU',
    logo: '/investments/heru.jpeg',
    url: 'https://www.heru.gg',
    overview: 'The esports arena for gamers, organizers, and sponsors across MENA.',
  },
  {
    name: 'ADLTIX',
    logo: '/investments/adltix.png',
    url: 'https://adltix.com',
    overview: 'AI-powered creator performance marketing for MENA, where brands pay only for attributed sales.',
  },
]
