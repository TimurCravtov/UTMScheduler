import { useCallback, useEffect, useState } from 'react'
import { specOf, type ScheduleModel } from '../lib/schedule'
import type { Mode, Selection, WeekParity } from '../types'

const STORAGE_KEY = 'orarState'

function readStored(): Partial<Selection> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Current mode / group / teacher / week filter, restored from and persisted to localStorage. */
export function useSelection(model: ScheduleModel) {
  const [selection, setSelection] = useState<Selection>(() => model.resolveSelection(readStored()))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
    } catch {
      // storage unavailable (private mode, quota): the selection just won't persist
    }
  }, [selection])

  const setMode = useCallback((mode: Mode) => setSelection((s) => ({ ...s, mode })), [])
  const setWeek = useCallback((week: WeekParity) => setSelection((s) => ({ ...s, week })), [])
  const setTeacher = useCallback((teacher: string) => setSelection((s) => ({ ...s, teacher })), [])
  const selectGroup = useCallback(
    (year: string, group: string) => setSelection((s) => ({ ...s, year, group, spec: specOf(group) })),
    [],
  )
  const selectYear = useCallback(
    (year: string) => setSelection((s) => model.resolveSelection({ ...s, year, group: undefined })),
    [model],
  )
  const selectSpec = useCallback(
    (spec: string) =>
      setSelection((s) => {
        const year = model.findYear(s.year)!
        return { ...s, spec, group: model.groupsOf(year, spec)[0] }
      }),
    [model],
  )

  return {
    selection,
    setMode,
    setWeek,
    setTeacher,
    selectGroup,
    selectYear,
    selectSpec,
  }
}
