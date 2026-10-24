import { createContext, useContext } from 'react'
import type { ScheduleModel } from '../lib/schedule'

export const ScheduleContext = createContext<ScheduleModel | null>(null)

export function useModel(): ScheduleModel {
  const model = useContext(ScheduleContext)
  if (!model) throw new Error('useModel must be used inside <ScheduleContext.Provider>')
  return model
}
