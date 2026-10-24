import { useState } from 'react'
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

type View = 'day' | 'week'
const VIEW_KEY = 'orarMobileView'

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'week' ? 'week' : 'day'
  } catch {
    return 'day'
  }
}

/** Mobile view: either one day (with day tabs) or the whole week listed day by day. */
export function DayView({ entries, mode, week, clashes, today, day, onDayChange }: Props) {
  const { data } = useModel()
  const [view, setView] = useState<View>(readView)

  function changeView(next: View) {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // storage unavailable: the choice just won't persist
    }
  }

  const slotsOf = (d: number) =>
    data.times
      .map((t, slot) => ({ t, slot }))
      .filter(({ slot }) => entries.some((e) => e.day === d && e.slot === slot && isVisible(e, week)))

  const renderSlots = (d: number) =>
    slotsOf(d).map(({ t, slot }) => {
      const [from, to] = t.split('-')
      return (
        <div className="slot" key={t}>
          <div className="t">
            <b>{from}</b>
            {to}
          </div>
          <SlotCell entries={entries} day={d} slot={slot} mode={mode} week={week} clashes={clashes} />
        </div>
      )
    })

  return (
    <div className="days">
      <div className="seg viewtoggle" role="group" aria-label={strings.viewLabel}>
        <button type="button" aria-pressed={view === 'day'} onClick={() => changeView('day')}>
          {strings.viewDay}
        </button>
        <button type="button" aria-pressed={view === 'week'} onClick={() => changeView('week')}>
          {strings.viewWeek}
        </button>
      </div>

      {view === 'day' ? (
        <>
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
          {slotsOf(day).length === 0 && <div className="empty">{strings.nothingToday}</div>}
          {renderSlots(day)}
        </>
      ) : (
        data.days.map((d, i) => (
          <section key={d} aria-label={d}>
            <h3 className={`dayhead${i === today ? ' today' : ''}`}>{d}</h3>
            {slotsOf(i).length === 0 ? <div className="dayempty">{strings.nothingToday}</div> : renderSlots(i)}
          </section>
        ))
      )}
    </div>
  )
}
