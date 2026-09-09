import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js'

/** ISO-3166 alpha-2 → flag emoji (regional indicator symbols). */
export function regionFlag(iso2: string): string {
  return String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

/** ISO-3166 alpha-2 → English country name (via Intl.DisplayNames; falls back to the code). */
export function regionName(iso2: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso2) || iso2
  } catch {
    return iso2
  }
}

export interface CountryOption { iso: string; name: string; code: string; flag: string }

/** All country dial codes, sorted by name, for the phone-field picker. Built
 *  lazily on first access so the ~250 entries (incl. an Intl.DisplayNames call
 *  per country) aren't constructed on every page load before the modal opens. */
let _countryOptions: CountryOption[] | null = null
export function getCountryOptions(): CountryOption[] {
  if (_countryOptions) return _countryOptions
  _countryOptions = getCountries()
    .map((iso) => ({ iso, name: regionName(iso), code: getCountryCallingCode(iso), flag: regionFlag(iso) }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return _countryOptions
}

/** Build a self-contained phone for the server: if a country was picked and
 *  the typed digits don't already start with '+', prefix the calling code so
 *  the server can parse/validate it standalone. */
export function sendablePhone(raw: string, countryIso: string): string {
  const v = (raw || '').trim()
  if (!v) return ''
  if (countryIso && !v.startsWith('+')) {
    try {
      return `+${getCountryCallingCode(countryIso as CountryCode)} ${v}`
    } catch { /* fall through */ }
  }
  return v
}
