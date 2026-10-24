export type Kind = 'curs' | 'lab' | 'sem' | 'proiect'

/** 0 = every week, 1 = odd weeks only, 2 = even weeks only */
export type WeekParity = 0 | 1 | 2

/** [year, group, day, slot, week, subject, kind, teacherIndexes, room] */
export type RawRecord = [
  year: string,
  group: string,
  day: number,
  slot: number,
  week: WeekParity,
  subject: string,
  kind: Kind,
  teachers: number[],
  room: string,
]

export interface StudyYear {
  y: string
  sem: string
  groups: string[]
}

/** Page-level values scraped alongside the timetable (see scripts/sync.mjs). */
export interface ScheduleMeta {
  title: string
  subtitle: string
  /** Local ISO date-time of the first Monday of the semester; its week is odd. */
  semesterStart: string
  semesterEnd: string
  /** Notes shown for specific week numbers, e.g. "7": "Evaluarea periodică". */
  weekNotes: Record<string, string>
  /** Full per-year timetable files, keyed by study year ("I", "II", …). */
  timetableLinks: Record<string, string>
  sourceUrl: string
  fetchedAt: string
}

export interface ScheduleData {
  meta: ScheduleMeta
  years: StudyYear[]
  times: string[]
  days: string[]
  teachers: string[]
  titles: string[]
  full: string[]
  rec: RawRecord[]
}

export interface Entry {
  year: string
  group: string
  /** Index into `ScheduleData.days` */
  day: number
  /** Index into `ScheduleData.times` */
  slot: number
  week: WeekParity
  subject: string
  kind: Kind
  teachers: string[]
  room: string
  /** Groups attending this activity (several in teacher mode, where identical activities are merged) */
  groups: string[]
}

export type Mode = 'group' | 'teacher'

export interface Selection {
  mode: Mode
  year: string
  spec: string
  group: string
  teacher: string | null
  week: WeekParity
}

export interface CurrentWeek {
  n: number
  par: 1 | 2
  mon: Date
  sun: Date
}
