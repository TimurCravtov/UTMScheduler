import type { CurrentWeek, Entry, Mode, ScheduleData, Selection, StudyYear, WeekParity } from '../types'

export const specOf = (group: string) => group.replace(/-\d+$/, '')

const collator = new Intl.Collator('ro', { numeric: true })

/** Strips accents and case so "Bîrcă" matches "birca". */
export const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const groupKey = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

/** Monday = 0 … Friday = 4, or -1 on weekends. */
export function todayIndex(now = new Date()): number {
  const d = now.getDay()
  return d >= 1 && d <= 5 ? d - 1 : -1
}

export const isVisible = (e: Entry, week: WeekParity) => week === 0 || e.week === 0 || e.week === week

/** Teacher activities in the same slot but different rooms (and overlapping weeks) can't both happen. */
export function findClashes(list: Entry[]): Set<Entry> {
  const bad = new Set<Entry>()
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      if (
        a.day === b.day &&
        a.slot === b.slot &&
        (a.week === 0 || b.week === 0 || a.week === b.week) &&
        a.room &&
        b.room &&
        a.room !== b.room
      ) {
        bad.add(a)
        bad.add(b)
      }
    }
  }
  return bad
}

export const formatDayMonth = (d: Date) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`

export interface GroupHit {
  year: string
  group: string
}

/** Everything derived from a loaded `ScheduleData`: lookups, searching and per-selection entries. */
export function createModel(data: ScheduleData) {
  const academicTitle = new Map<string, string>()
  const fullName = new Map<string, string>()
  data.teachers.forEach((name, i) => {
    if (data.titles[i]) academicTitle.set(name, data.titles[i])
    if (data.full[i]) fullName.set(name, data.full[i])
  })

  /** Full name when known, otherwise the abbreviated one (e.g. "Ababii N."). */
  const displayName = (teacher: string) => fullName.get(teacher) ?? teacher
  const getTitle = (teacher: string) => academicTitle.get(teacher)
  const teacherLabel = (teacher: string) => {
    const title = academicTitle.get(teacher)
    return title ? `${title} ${displayName(teacher)}` : displayName(teacher)
  }

  const entries: Entry[] = data.rec.map(([year, group, day, slot, week, subject, kind, teachers, room]) => ({
    year,
    group,
    day,
    slot,
    week,
    subject,
    kind,
    teachers: teachers.map((i) => data.teachers[i]),
    room,
    groups: [group],
  }))

  const findYear = (year: string | undefined) => data.years.find((y) => y.y === year)
  const specsOf = (year: StudyYear) => [...new Set(year.groups.map(specOf))]
  const groupsOf = (year: StudyYear, spec: string) =>
    year.groups.filter((g) => specOf(g) === spec).sort(collator.compare)

  /** Makes year / spec / group consistent with each other and with the data. */
  function resolveSelection(partial: Partial<Selection>): Selection {
    const year = findYear(partial.year) ?? data.years[0]
    const specs = specsOf(year)
    const groupValid = !!partial.group && year.groups.includes(partial.group)
    const spec = groupValid
      ? specOf(partial.group!)
      : partial.spec && specs.includes(partial.spec)
        ? partial.spec
        : specs[0]
    return {
      mode: partial.mode === 'teacher' ? 'teacher' : 'group',
      year: year.y,
      spec,
      group: groupValid ? partial.group! : groupsOf(year, spec)[0],
      teacher: partial.teacher && data.teachers.includes(partial.teacher) ? partial.teacher : null,
      week: partial.week === 1 || partial.week === 2 ? partial.week : 0,
    }
  }

  function searchGroups(query: string, limit = 16): GroupHit[] {
    const q = groupKey(query)
    if (!q) return []
    const hits: GroupHit[] = []
    for (const y of data.years) {
      for (const g of y.groups) if (groupKey(g).includes(q)) hits.push({ year: y.y, group: g })
    }
    return hits.slice(0, limit)
  }

  function searchTeachers(query: string, limit = 60): string[] {
    const q = fold(query.trim())
    return data.teachers
      .filter((t) => !q || fold(t).includes(q) || fold(displayName(t)).includes(q))
      .sort((a, b) => displayName(a).localeCompare(displayName(b), 'ro'))
      .slice(0, limit)
  }

  /** Entries to show for the selection. In teacher mode identical activities are merged across groups. */
  function getEntries(mode: Mode, group: string, teacher: string | null): Entry[] {
    if (mode === 'group') return entries.filter((e) => e.group === group)
    if (!teacher) return []
    const merged = new Map<string, Entry>()
    for (const e of entries) {
      if (!e.teachers.includes(teacher)) continue
      const key = [e.day, e.slot, e.week, fold(e.subject).replace(/\s+/g, ''), e.room].join('|')
      const existing = merged.get(key)
      if (existing) {
        if (!existing.groups.includes(e.group)) existing.groups.push(e.group)
      } else {
        merged.set(key, { ...e, groups: [e.group] })
      }
    }
    return [...merged.values()]
  }

  const semesterStart = new Date(data.meta.semesterStart)
  const semesterEnd = new Date(data.meta.semesterEnd)

  function currentWeek(now = new Date()): CurrentWeek | null {
    if (now < semesterStart || now > semesterEnd) return null
    const mon = new Date(now)
    mon.setHours(0, 0, 0, 0)
    mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7))
    const n = Math.round((mon.getTime() - semesterStart.getTime()) / (7 * 864e5)) + 1
    const sun = new Date(mon)
    sun.setDate(sun.getDate() + 6)
    return { n, par: n % 2 === 1 ? 1 : 2, mon, sun }
  }

  return {
    data,
    meta: data.meta,
    getTitle,
    displayName,
    teacherLabel,
    findYear,
    specsOf,
    groupsOf,
    resolveSelection,
    searchGroups,
    searchTeachers,
    getEntries,
    currentWeek,
  }
}

export type ScheduleModel = ReturnType<typeof createModel>
