// Scrapes the FCIM schedule page and writes public/data/schedule.json.
// The page embeds the whole timetable (data, links, semester dates, titles) inside inline scripts,
// so there is no API to call: we download the HTML and pull those values out of it.
//
//   npm run sync                       -> default source
//   npm run sync -- <url>              -> another page
//   SCHEDULE_SOURCE_URL=<url> npm run sync
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_URL = 'https://fcim.utm.md/orar-sectia-zi-2/'
const sourceUrl = process.argv[2] ?? process.env.SCHEDULE_SOURCE_URL ?? DEFAULT_URL
const outFile = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/schedule.json')

function fail(what) {
  throw new Error(`Could not find ${what} in ${sourceUrl}. The page layout may have changed.`)
}

/** Returns the JSON/JS literal that starts at `html[start]` (a `{`, `[` or `"`), honouring strings. */
function literalAt(html, start) {
  const open = html[start]
  if (open === '"') {
    for (let i = start + 1; i < html.length; i++) {
      if (html[i] === '\\') i++
      else if (html[i] === '"') return html.slice(start, i + 1)
    }
    return null
  }
  let depth = 0
  let inString = false
  for (let i = start; i < html.length; i++) {
    const c = html[i]
    if (inString) {
      if (c === '\\') i++
      else if (c === '"') inString = false
    } else if (c === '"') inString = true
    else if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') {
      depth--
      if (depth === 0) return html.slice(start, i + 1)
    }
  }
  return null
}

function extractAfter(html, marker, what) {
  const at = html.indexOf(marker)
  if (at < 0) fail(what)
  let start = at + marker.length
  while (/\s/.test(html[start])) start++
  const literal = literalAt(html, start)
  if (!literal) fail(what)
  return JSON.parse(literal)
}

const pad = (n) => String(n).padStart(2, '0')
/** `new Date(2026,7,31)` uses a zero-based month; we store local ISO strings without a zone. */
function localIso([y, m, d, h = 0, min = 0]) {
  return `${y}-${pad(m + 1)}-${pad(d)}T${pad(h)}:${pad(min)}:00`
}

function dateArgs(html, name, what) {
  const m = html.match(new RegExp(`${name}\\s*=\\s*new Date\\(([^)]*)\\)`))
  if (!m) fail(what)
  return m[1].split(',').map((n) => Number(n.trim()))
}

const REQUEST_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
  'accept-language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
}

/** Derives the WordPress REST API URL for a given page URL (`https://host/slug/` -> `/wp-json/wp/v2/pages?slug=...`). */
function wpApiUrl(pageUrl) {
  try {
    const u = new URL(pageUrl)
    const slug = u.pathname.split('/').filter(Boolean).pop()
    if (!slug) return null
    return `${u.origin}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=content`
  } catch {
    return null
  }
}

const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL ?? 'http://127.0.0.1:8191/v1'

async function fetchViaFlareSolverr(url) {
  try {
    const res = await fetch(FLARESOLVERR_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cmd: 'request.get', url, maxTimeout: 60000 }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const html = data?.solution?.response
    if (data?.status === 'ok' && typeof html === 'string' && html.includes('const D=')) {
      console.log(`Fetched via FlareSolverr (${ data.message || 'ok' })`)
      return html
    }
  } catch {
    // FlareSolverr not running locally; fall through
  }
  return null
}

async function fetchPageHtml(url) {
  const res = await fetch(url, { headers: REQUEST_HEADERS })
  if (res.ok) return await res.text()

  const apiUrl = wpApiUrl(url)
  if (apiUrl) {
    const apiRes = await fetch(apiUrl, {
      headers: { ...REQUEST_HEADERS, accept: 'application/json' },
    })
    if (apiRes.ok) {
      const pages = await apiRes.json()
      const rendered = pages?.[0]?.content?.rendered
      if (typeof rendered === 'string' && rendered.length > 0) {
        console.log(`Fetched via WordPress REST API fallback (${apiUrl})`)
        return rendered
      }
    }
  }

  const solved = await fetchViaFlareSolverr(url)
  if (solved) return solved

  throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`)
}

const html = await fetchPageHtml(sourceUrl)

const data = extractAfter(html, 'const D=', 'the schedule data (const D=)')
// Refuse to overwrite good data with an empty or reshaped payload
if (!Array.isArray(data.rec) || !data.rec.length || !Array.isArray(data.years) || !data.years.length) {
  fail('any timetable records')
}

// Full-timetable links: window.ORAR_FCIM_EXCEL = { "Anul I": "…", … }
const rawLinks = extractAfter(html, 'window.ORAR_FCIM_EXCEL =', 'the timetable file links')
const timetableLinks = Object.fromEntries(
  Object.entries(rawLinks)
    .map(([key, url]) => [key.replace(/^Anul\s+/i, ''), String(url).trim()])
    .filter(([, url]) => url),
)

// Heading and subtitle live in the markup string the widget injects into its shadow root.
const markupMatch = html.match(/root\.innerHTML\s*=\s*/)
if (!markupMatch) fail('the widget markup')
const markup = JSON.parse(literalAt(html, markupMatch.index + markupMatch[0].length))
const title = markup.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.trim() ?? fail('the <h1> title')
const subtitle = markup.match(/<p class="sub">(.*?)<\/p>/s)?.[1]?.trim() ?? ''

const weekNotesBody = html.match(/WEEK_NOTES\s*=\s*\{([^}]*)\}/)?.[1] ?? ''
const weekNotes = Object.fromEntries(
  [...weekNotesBody.matchAll(/(\d+)\s*:\s*(['"])(.*?)\2/g)].map((m) => [m[1], m[3]]),
)

const meta = {
  title,
  subtitle,
  semesterStart: localIso(dateArgs(html, 'SEM_START', 'the semester start date')),
  semesterEnd: localIso(dateArgs(html, 'SEM_END', 'the semester end date')),
  weekNotes,
  timetableLinks,
  sourceUrl,
  fetchedAt: new Date().toISOString(),
}

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, JSON.stringify({ meta, ...data }))
console.log(
  `Wrote ${outFile}\n  ${data.rec.length} records, ${data.teachers.length} teachers, ${data.years.length} years — "${title}"`,
)
