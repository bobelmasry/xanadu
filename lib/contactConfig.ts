import { SUBSIDIARIES, divisionName, type Subsidiary } from './subsidiaries'

export interface Step {
  title: string
  subtitle?: string
  description?: string
  options?: string[]
  freeText?: boolean
}

export const STEPS: Step[] = [
  {
    title: 'Welcome',
    subtitle: "Let's find the right path for you.",
    description: "Answer a few quick questions so we can understand your business and connect you with the right team inside Xanadu.",
  },
  {
    title: 'What do you need help with?',
    options: ['Growth & Strategy', 'Technology & Systems', 'Investment & Funding', 'Market Expansion & Trade', 'Sports & Sponsorships', 'Building a New Idea', 'Web3 & Crypto'],
  },
  {
    title: 'What stage is your company at?',
    options: ['Startup (pre-revenue or early)', 'Scaling (established, looking to grow)', 'Enterprise (large, optimizing)'],
  },
  {
    title: "What's your biggest challenge right now?",
    freeText: true,
  },
  {
    title: "Almost there!",
    subtitle: "How can we reach you?",
  },
]

export interface Routing { division: string; color: string }

// Division + accent color are DERIVED from lib/subsidiaries.ts (divisionName
// + Subsidiary.color) — the map below only owns the need → subsidiary-id
// routing. Two needs intentionally route to ventures ('Investment & Funding'
// and 'Building a New Idea'). An unknown id throws at load time rather than
// shipping a half-configured contact flow.
const to = (id: string): Routing => {
  const s: Subsidiary | undefined = SUBSIDIARIES.find((x) => x.id === id)
  if (!s) throw new Error(`ROUTING references unknown subsidiary id "${id}"`)
  return { division: divisionName(s), color: s.color }
}

export const ROUTING: Record<string, Routing> = {
  'Growth & Strategy': to('consulting'),
  'Technology & Systems': to('soft'),
  'Investment & Funding': to('ventures'),
  'Market Expansion & Trade': to('trading'),
  'Sports & Sponsorships': to('sports'),
  'Building a New Idea': to('ventures'),
  'Web3 & Crypto': to('xw3'),
}
