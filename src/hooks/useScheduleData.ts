import { useEffect, useState } from 'react'
import { createModel, type ScheduleModel } from '../lib/schedule'
import type { ScheduleData } from '../types'

/** Where `npm run sync` writes the scraped timetable. Override with VITE_SCHEDULE_DATA_URL. */
const DATA_URL = import.meta.env.VITE_SCHEDULE_DATA_URL ?? `${import.meta.env.BASE_URL}data/schedule.json`

export type DataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; model: ScheduleModel }

export function useScheduleData(): DataState {
  const [state, setState] = useState<DataState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetch(DATA_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res.json() as Promise<ScheduleData>
      })
      .then((data) => setState({ status: 'ready', model: createModel(data) }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      })
    return () => controller.abort()
  }, [])

  return state
}
