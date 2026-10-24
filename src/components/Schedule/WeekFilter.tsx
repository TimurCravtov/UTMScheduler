import { useMemo } from 'react'
import { useModel } from '../../context/ScheduleContext'
import { formatDayMonth } from '../../lib/schedule'
import { strings } from '../../strings'
import type { WeekParity } from '../../types'

interface Props {
  week: WeekParity
  onChange: (week: WeekParity) => void
}

export function WeekFilter({ week, onChange }: Props) {
  const model = useModel()
  const current = useMemo(() => model.currentWeek(), [model])
  const note = current ? model.meta.weekNotes[current.n] : undefined

  return (
    <div className="controls compact">
      <div className="field">
        <div className="chips" role="group" aria-label={strings.weekLabel}>
          {strings.weekOptions.map((label, i) => {
            const parity = i as WeekParity
            const isNow = !!current && current.par === parity
            return (
              <button
                type="button"
                key={label}
                className={`chip${isNow ? ' now' : ''}`}
                aria-pressed={parity === week}
                onClick={() => onChange(parity)}
              >
                {label}
                {isNow && <span className="nowdot" title={strings.currentWeekMark} />}
              </button>
            )
          })}
        </div>
      </div>
      <div className="curweek" aria-live="polite">
        {current ? (
          <>
            {strings.currentWeekPrefix} <b>{strings.currentWeek(current.n)}</b>,{' '}
            <span className="curpar">{strings.parityName[current.par]}</span>{' '}
            <span className="curdates">
              ({formatDayMonth(current.mon)}–{formatDayMonth(current.sun)})
            </span>
            {note && (
              <>
                {' '}
                <span className="curnote">{note}</span>
              </>
            )}
          </>
        ) : (
          strings.outsideSemester
        )}
      </div>
    </div>
  )
}
