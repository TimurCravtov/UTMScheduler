import { useEffect, useState } from 'react'

const BASE = `${import.meta.env.BASE_URL}ics/`

/** Path of a group's calendar file, relative to the site. */
export const calendarPath = (group: string) => `${BASE}${encodeURIComponent(group)}.ics`

/** Groups that have a generated .ics file (written by `npm run ics`). Empty if the index is missing. */
export function useCalendarGroups(): Set<string> {
  const [groups, setGroups] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${BASE}index.json`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<string[]>) : []))
      .then((list) => setGroups(new Set(list)))
      .catch(() => {
        // no calendars published: the buttons simply don't show
      })
    return () => controller.abort()
  }, [])

  return groups
}
