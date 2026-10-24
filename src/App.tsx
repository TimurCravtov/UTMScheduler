import { Schedule } from './components/Schedule/Schedule'
import { ScheduleContext } from './context/ScheduleContext'
import { useScheduleData } from './hooks/useScheduleData'
import { strings } from './strings'

export default function App() {
  const state = useScheduleData()

  if (state.status === 'loading') return <p className="page-status">{strings.loading}</p>
  if (state.status === 'error') return <p className="page-status error">{strings.loadError(state.message)}</p>

  return (
    <ScheduleContext.Provider value={state.model}>
      <Schedule />
    </ScheduleContext.Provider>
  )
}
