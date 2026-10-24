import { useModel } from '../../context/ScheduleContext'
import { isVisible } from '../../lib/schedule'
import { strings } from '../../strings'
import type { Entry, Mode, WeekParity } from '../../types'
import { SlotCell } from './SlotCell'

interface Props {
  entries: Entry[]
  mode: Mode
  week: WeekParity
  clashes: Set<Entry>
  today: number
  day: number
  onDayChange: (day: number) => void
}

/** Mobile view: day tabs and the activities of the selected day. */
export function DayView({ entries, mode, week, clashes, today, day, onDayChange }: Props) {
  const { data } = useModel()
  const slots = data.times
    .map((t, slot) => ({ t, slot }))
    .filter(({ slot }) => entries.some((e) => e.day === day && e.slot === slot && isVisible(e, week)))

  return (
    <div className="days">
      <div className="daytabs" role="group" aria-label={strings.dayTabs}>
        {data.days.map((d, i) => (
          <button
            key={d}
            type="button"
            className={i === today ? 'istoday' : ''}
            aria-pressed={i === day}
            onClick={() => onDayChange(i)}
          >
            {d.slice(0, 3)}
            {i === today && <span className="nowdot" />}
          </button>
        ))}
      </div>
      {slots.length === 0 && <div className="empty">{strings.nothingToday}</div>}
      {slots.map(({ t, slot }) => {
        const [from, to] = t.split('-')
        return (
          <div className="slot" key={t}>
            <div className="t">
              <b>{from}</b>
              {to}
            </div>
            <SlotCell entries={entries} day={day} slot={slot} mode={mode} week={week} clashes={clashes} />
          </div>
        )
      })}
    </div>
  )
}
