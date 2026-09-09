/**
 * The delivered/persisted lead shape. Lives in this neutral module (rather than
 * a storage-specific one) so `mail.ts`, `file.ts`, and the route handler share
 * one definition. (Moved out of `lib/leads/sheets.ts` when Phase 17 removed the
 * Sheets store — leads are now delivered email-only via GoDaddy SMTP.)
 */
export type SessionType = 'free' | 'paid'

export interface Lead {
  timestamp: string
  name: string
  email: string
  phone: string
  company: string
  matchedDivision: string
  /** `''` when the submitter picked no session (validate() allows it unset). */
  sessionType: SessionType | ''
  needHelpWith: string
  stage: string
  challenge: string
  consent: boolean
}
