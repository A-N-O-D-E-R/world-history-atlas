// Date model shared by the data pipeline and the app (ADR 0001).
// Historical years: -1 = 1 BCE, 1 = 1 CE, there is no year 0.
// Internally everything is reduced to a Julian Day Number (JDN), which
// doubles as the proleptic-Gregorian sort key.

export type Precision = 'day' | 'month' | 'year' | 'century'
export type Calendar = 'gregorian' | 'julian'
export type Lang = 'fr' | 'en'

/** A date as given by its Source, plus the build-computed sort key. */
export interface DatePoint {
  value: string // "-52", "987", "1180-05", "1789-07-14" (source calendar)
  calendar: Calendar
  precision: Precision
  sortKey: number // JDN of the first day covered, proleptic Gregorian
}
export interface DateInterval {
  earliest: DatePoint
  latest: DatePoint
}
export type HistDate = DatePoint | DateInterval

/** A calendar day: historical year (no 0), month 1-12, day 1-31. */
export interface Ymd {
  year: number
  month: number
  day: number
}

const astro = (year: number) => (year < 0 ? year + 1 : year)
const hist = (astroYear: number) => (astroYear <= 0 ? astroYear - 1 : astroYear)

function isLeap(year: number, calendar: Calendar): boolean {
  const a = astro(year)
  const div = (n: number) => ((a % n) + n) % n === 0
  return calendar === 'julian' ? div(4) : div(4) && (!div(100) || div(400))
}

export function daysInMonth(
  year: number,
  month: number,
  calendar: Calendar = 'gregorian',
): number {
  if (month === 2) return isLeap(year, calendar) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function toJdn(
  { year, month, day }: Ymd,
  calendar: Calendar = 'gregorian',
): number {
  const a = Math.floor((14 - month) / 12)
  const y = astro(year) + 4800 - a
  const m = month + 12 * a - 3
  const base = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4)
  return calendar === 'julian'
    ? base - 32083
    : base - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

export function fromJdn(jdn: number): Ymd {
  const a = jdn + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor((146097 * b) / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: hist(100 * b + d - 4800 + Math.floor(m / 10)),
  }
}

export function julianToGregorian(ymd: Ymd): Ymd {
  return fromJdn(toJdn(ymd, 'julian'))
}

interface Parsed {
  year: number
  month?: number
  day?: number
}

function parse(value: string): Parsed | null {
  const m = /^(-?\d{1,4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(value.trim())
  if (!m) return null
  return {
    year: Number(m[1]),
    month: m[2] ? Number(m[2]) : undefined,
    day: m[3] ? Number(m[3]) : undefined,
  }
}

const PARTS: Record<Precision, number> = {
  day: 3,
  month: 2,
  year: 1,
  century: 1,
}

/** Returns an error message (fr) or null when the value is valid. */
export function validate(
  value: string,
  precision: Precision,
  calendar: Calendar = 'gregorian',
): string | null {
  const p = parse(value)
  if (!p)
    return 'format attendu : AAAA, AAAA-MM ou AAAA-MM-JJ (négatif = av. J.-C.)'
  if (p.year === 0)
    return "l'année 0 n'existe pas (-1 = 1 av. J.-C., 1 = 1 apr. J.-C.)"
  const parts = p.day !== undefined ? 3 : p.month !== undefined ? 2 : 1
  if (parts !== PARTS[precision])
    return `la valeur ne correspond pas à la précision « ${precision} »`
  if (p.month !== undefined && (p.month < 1 || p.month > 12))
    return 'mois invalide'
  if (
    p.day !== undefined &&
    (p.day < 1 || p.day > daysInMonth(p.year, p.month!, calendar))
  )
    return 'jour invalide pour ce mois'
  return null
}

const centuryOf = (year: number) =>
  year > 0 ? Math.ceil(year / 100) : -Math.ceil(-year / 100)
const centuryStart = (c: number) => (c > 0 ? (c - 1) * 100 + 1 : c * 100)

/** First day covered by a value, in the source calendar. */
function firstDay(p: Parsed, precision: Precision): Ymd {
  if (precision === 'century')
    return { year: centuryStart(centuryOf(p.year)), month: 1, day: 1 }
  return { year: p.year, month: p.month ?? 1, day: p.day ?? 1 }
}

export function makeDatePoint(
  value: string,
  precision: Precision,
  calendar: Calendar = 'gregorian',
): DatePoint {
  const err = validate(value, precision, calendar)
  if (err) throw new Error(`Date invalide « ${value} » : ${err}`)
  return {
    value,
    calendar,
    precision,
    sortKey: toJdn(firstDay(parse(value)!, precision), calendar),
  }
}

export const isInterval = (d: HistDate): d is DateInterval => 'earliest' in d

/** Sort key of any HistDate (an interval sorts by its earliest bound). */
export const sortKeyOf = (d: HistDate) =>
  isInterval(d) ? d.earliest.sortKey : d.sortKey

// ---------- formatting (always displayed in Gregorian) ----------

const MONTHS: Record<Lang, string[]> = {
  fr: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
}

function roman(n: number): string {
  const t: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let s = ''
  for (const [v, k] of t)
    while (n >= v) {
      s += k
      n -= v
    }
  return s
}

const ordinal = (n: number) =>
  n +
  (n % 100 >= 11 && n % 100 <= 13
    ? 'th'
    : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'))

export function formatYear(year: number, lang: Lang = 'fr'): string {
  if (year > 0) return String(year)
  return lang === 'fr' ? `${-year} av. J.-C.` : `${-year} BCE`
}

export function formatCentury(year: number, lang: Lang = 'fr'): string {
  const c = Math.abs(centuryOf(year))
  if (lang === 'fr') return `${roman(c)}ᵉ siècle${year < 0 ? ' av. J.-C.' : ''}`
  return `${ordinal(c)} century${year < 0 ? ' BCE' : ''}`
}

export function formatYmd(
  ymd: Ymd,
  precision: Precision,
  lang: Lang = 'fr',
): string {
  if (precision === 'century') return formatCentury(ymd.year, lang)
  const y = formatYear(ymd.year, lang)
  if (precision === 'year') return y
  const month = MONTHS[lang][ymd.month - 1]
  if (precision === 'month') return `${month} ${y}`
  if (lang === 'fr') return `${ymd.day === 1 ? '1er' : ymd.day} ${month} ${y}`
  return `${month} ${ymd.day}, ${y}`
}

export function formatPoint(d: DatePoint, lang: Lang = 'fr'): string {
  // Day/month values are converted to Gregorian through the sort key; year
  // and century are shown as given (the calendar shift never crosses them).
  const ymd =
    d.precision === 'day' || d.precision === 'month'
      ? fromJdn(d.sortKey)
      : firstDay(parse(d.value)!, 'year')
  return formatYmd(ymd, d.precision, lang)
}

export function formatDate(d: HistDate, lang: Lang = 'fr'): string {
  if (!isInterval(d)) return formatPoint(d, lang)
  const [a, b] = [formatPoint(d.earliest, lang), formatPoint(d.latest, lang)]
  return lang === 'fr' ? `entre ${a} et ${b}` : `between ${a} and ${b}`
}

// ---------- timeline stepping (Gregorian cursor) ----------

export type StepUnit = 'day' | 'month' | 'year'

const skipZero = (year: number, dir: number) => (year === 0 ? dir : year)

export function step(cur: Ymd, unit: StepUnit, dir: 1 | -1): Ymd {
  if (unit === 'day') return fromJdn(toJdn(cur) + dir)
  let { year, month } = cur
  if (unit === 'year') year = skipZero(year + dir, dir)
  else {
    month += dir
    if (month > 12) [month, year] = [1, skipZero(year + 1, 1)]
    if (month < 1) [month, year] = [12, skipZero(year - 1, -1)]
  }
  return { year, month, day: Math.min(cur.day, daysInMonth(year, month)) }
}
