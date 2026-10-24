import { LuMapPin, LuUser, LuUsers } from 'react-icons/lu'
import { useModel } from '../../context/ScheduleContext'
import { isVisible } from '../../lib/schedule'
import { strings } from '../../strings'
import type { Entry, Mode, WeekParity } from '../../types'
import { KIND_ICON } from './kindIcons'

interface Props {
  entry: Entry
  mode: Mode
  week: WeekParity
  clash: boolean
}

export function EventCard({ entry, mode, week, clash }: Props) {
  const { displayName, teacherLabel } = useModel()
  const KindIcon = KIND_ICON[entry.kind]
  const WhoIcon = mode === 'group' ? LuUser : LuUsers
  // Group mode lists the teachers (titles only in the tooltip); teacher mode lists the groups.
  const who = mode === 'group' ? entry.teachers.map(displayName).join(', ') : entry.groups.join(', ')
  const whoTitle = mode === 'group' ? entry.teachers.map(teacherLabel).join(', ') : undefined
  const className = ['ev', entry.kind, clash && 'clash', !isVisible(entry, week) && 'dim'].filter(Boolean).join(' ')

  return (
    <div className={className}>
      {entry.week !== 0 && (
        <span className="wk" title={strings.onlyInWeek(entry.week)}>
          {strings.weekTag(entry.week)}
        </span>
      )}
      <div className="s">
        <KindIcon title={strings.kind[entry.kind]} />
        <span>{entry.subject}</span>
      </div>
      {who && (
        <div className="m" title={whoTitle}>
          <WhoIcon title={mode === 'group' ? strings.teacher : strings.groups} />
          <span>{who}</span>
        </div>
      )}
      {entry.room && (
        <div className="m">
          <LuMapPin title={strings.room} />
          <span>{entry.room}</span>
        </div>
      )}
    </div>
  )
}
