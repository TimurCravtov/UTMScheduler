// Generates one iCalendar file per group from public/data/schedule.json into public/ics/<group>.ics.
// Each activity becomes a weekly recurring event (every second week for odd/even-week activities)
// from the semester start until the semester end, so the files can be imported or subscribed to.
//
//   npm run ics                    -> groups listed in scripts/ics-groups.json
//   npm run ics -- FAF-231 SI-261  -> just these groups
// (also runs as part of `npm run sync`)
import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataFile = resolve(root, 'public/data/schedule.json')
const groupsFile = resolve(root, 'scripts/ics-groups.json')
const outDir = resolve(root, 'public/ics')

// IANA zone of the faculty; the VTIMEZONE below has to match it.
const TZID = 'Europe/Chisinau'
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZID}`,
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0300',
  'TZNAME:EEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0300',
  'TZOFFSETTO:+0200',
  'TZNAME:EET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
]

// Mirrors the activity-kind labels shown in the app (src/strings.ts).
const KIND_LABELS = { curs: 'Curs', lab: 'Laborator', sem: 'Seminar / practică', proiect: 'Proiect' }

const pad = (n) => String(n).padStart(2, '0')

/** Splits "2026-08-31T00:00:00" into numbers without going through the machine's time zone. */
function parseLocal(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return { y, m, d }
}

/** Date `offset` days after the given calendar date, as UTC-based parts. */
function addDays({ y, m, d }, offset) {
  const t = new Date(Date.UTC(y, m - 1, d + offset))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

const ymd = ({ y, m, d }) => `${y}${pad(m)}${pad(d)}`

/** "8.00" / "13.30" -> "080000" / "133000" */
function hhmmss(time) {
  const [h, min] = time.split('.')
  return `${pad(Number(h))}${pad(Number(min ?? 0))}00`
}

function escapeText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Folds a content line at 75 octets without splitting a UTF-8 character. */
function fold(line) {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const parts = []
  let start = 0
  let limit = 75
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length)
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--
    parts.push(bytes.subarray(start, end).toString('utf8'))
    start = end
    limit = 74
  }
  return parts.join('\r\n ')
}

const uid = (group, parts) =>
  `${createHash('sha1').update([group, ...parts].join('|')).digest('hex').slice(0, 20)}@utmscheduler`

const data = JSON.parse(await readFile(dataFile, 'utf8'))
const { meta } = data
const semesterStart = parseLocal(meta.semesterStart) // a Monday; its week is odd
const until = `${ymd(parseLocal(meta.semesterEnd))}T235959Z`
const stamp = new Date(meta.fetchedAt).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')

const teacherLabel = (i) => {
  const title = data.titles[i]
  const name = data.full[i] || data.teachers[i]
  return title ? `${title} ${name}` : name
}

function eventLines(group, rec) {
  const [, , day, slot, week, subject, kind, teacherIdx, room] = rec
  const [from, to] = data.times[slot].split('-')
  // Odd-week activities start in week 1, even-week ones in week 2, the rest in week 1 and repeat weekly.
  const date = ymd(addDays(semesterStart, day + (week === 2 ? 7 : 0)))
  const description = [KIND_LABELS[kind] ?? kind, teacherIdx.map(teacherLabel).join(', ')].filter(Boolean).join('\n')
  return [
    'BEGIN:VEVENT',
    `UID:${uid(group, [day, slot, week, subject, room, teacherIdx.join(',')])}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZID}:${date}T${hhmmss(from)}`,
    `DTEND;TZID=${TZID}:${date}T${hhmmss(to)}`,
    `RRULE:FREQ=WEEKLY;INTERVAL=${week === 0 ? 1 : 2};UNTIL=${until}`,
    `SUMMARY:${escapeText(subject)}`,
    room ? `LOCATION:${escapeText(room)}` : null,
    description ? `DESCRIPTION:${escapeText(description)}` : null,
    'END:VEVENT',
  ].filter(Boolean)
}

function calendar(group, recs) {
  const name = `${meta.title} – ${group}`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UTM Scheduler//Orar FCIM//RO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    `X-WR-TIMEZONE:${TZID}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...VTIMEZONE,
    ...recs.flatMap((rec) => eventLines(group, rec)),
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

const byGroup = new Map()
for (const rec of data.rec) {
  if (!byGroup.has(rec[1])) byGroup.set(rec[1], [])
  byGroup.get(rec[1]).push(rec)
}

const requested = process.argv.length > 2 ? process.argv.slice(2) : JSON.parse(await readFile(groupsFile, 'utf8'))
const missing = requested.filter((g) => !byGroup.has(g))
if (missing.length) throw new Error(`No timetable found for: ${missing.join(', ')}`)

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })
let events = 0
for (const group of requested) {
  if (!/^[\p{L}\p{N}-]+$/u.test(group)) throw new Error(`Unexpected group code for a file name: ${group}`)
  const recs = byGroup.get(group)
  await writeFile(resolve(outDir, `${group}.ics`), calendar(group, recs))
  events += recs.length
}
// The app reads this to know which groups have a calendar to offer.
await writeFile(resolve(outDir, 'index.json'), JSON.stringify(requested))
console.log(`Wrote ${requested.length} calendars (${events} events) to ${outDir}`)
