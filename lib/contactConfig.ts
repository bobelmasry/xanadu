import type { SessionType } from './leads/types'

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

export const ROUTING: Record<string, Routing> = {
  'Growth & Strategy': { division: 'Xanadu Consulting', color: '#28D75A' },
  'Technology & Systems': { division: 'Xanadu Soft', color: '#4176FA' },
  'Investment & Funding': { division: 'Xanadu Ventures', color: '#FFD21F' },
  'Market Expansion & Trade': { division: 'Xanadu Trading', color: '#4D7CFF' },
  'Sports & Sponsorships': { division: 'Xanadu Sports', color: '#FF4E33' },
  'Building a New Idea': { division: 'Xanadu Ventures', color: '#FFD21F' },
  'Web3 & Crypto': { division: 'Web3', color: '#9344DE' },
}

/** Resolve the scheduling embed URL for a session type. Env-gated: returns null
 *  (→ the flow skips the booking step straight to confirmation) when no calendar
 *  URL is configured. Only https: URLs are honored — the value flows verbatim
 *  into an iframe src, so a `javascript:`/`data:` value (or a plain http:
 *  downgrade) must never reach the DOM. NEXT_PUBLIC_ vars are inlined at
 *  build, client-safe. */
export function getCalendarUrl(sessionType: SessionType): string | null {
  const generic = process.env.NEXT_PUBLIC_CALENDAR_URL
  const url = sessionType === 'paid'
    ? process.env.NEXT_PUBLIC_CALENDAR_PAID_URL || generic
    : process.env.NEXT_PUBLIC_CALENDAR_FREE_URL || generic
  if (!url) return null
  try {
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}
