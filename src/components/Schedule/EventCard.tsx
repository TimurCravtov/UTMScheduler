import { useModel } from '../../context/ScheduleContext'
import { isVisible } from '../../lib/schedule'
import { strings } from '../../strings'
import type { Entry, Mode, WeekParity } from '../../types'

interface Props {
  entry: Entry
  mode: Mode
  week: WeekParity
  clash: boolean
}

export function EventCard({ entry, mode, week, clash }: Props) {
  const { teacherLabel } = useModel()
  const who = mode === 'group' ? entry.teachers.map(teacherLabel).join(', ') : entry.groups.join(', ')
  const className = ['ev', entry.kind, clash && 'clash', !isVisible(entry, week) && 'dim'].filter(Boolean).join(' ')

  return (
    <div className={className} title={strings.kind[entry.kind]}>
      {entry.week !== 0 && (
        <span className="wk" title={strings.onlyInWeek(entry.week)}>
          {strings.weekTag(entry.week)}
        </span>
      )}
      <div className="s">{entry.subject}</div>
      {who && <div className="m">{who}</div>}
      {entry.room && (
        <div className="m">
          {/^aula/i.test(entry.room) ? '' : strings.roomPrefix}
          {entry.room}
        </div>
      )}
    </div>
  )
}
