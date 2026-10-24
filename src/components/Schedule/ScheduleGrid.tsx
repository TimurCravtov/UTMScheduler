import { useModel } from '../../context/ScheduleContext'
import { strings } from '../../strings'
import type { Entry, Mode, WeekParity } from '../../types'
import { SlotCell } from './SlotCell'

interface Props {
  entries: Entry[]
  mode: Mode
  week: WeekParity
  clashes: Set<Entry>
  today: number
}

/** Desktop week view: one column per day, one row per time slot. */
export function ScheduleGrid({ entries, mode, week, clashes, today }: Props) {
  const { data } = useModel()

  return (
    <div className="gridwrap">
      <table className="grid">
        <thead>
          <tr>
            <th>{strings.hours}</th>
            {data.days.map((d, i) => (
              <th key={d} className={i === today ? 'today' : ''}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.times.map((t, slot) => {
            const [from, to] = t.split('-')
            return (
              <tr key={t}>
                <td className="time">
                  <b>{from}</b>
                  {to}
                </td>
                {data.days.map((d, day) => (
                  <td key={d} className={day === today ? 'todaycol' : ''}>
                    <SlotCell entries={entries} day={day} slot={slot} mode={mode} week={week} clashes={clashes} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
