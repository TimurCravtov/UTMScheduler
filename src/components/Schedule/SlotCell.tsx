import { isVisible } from '../../lib/schedule'
import { strings } from '../../strings'
import type { Entry, Mode, WeekParity } from '../../types'
import { EventCard } from './EventCard'

interface Props {
  entries: Entry[]
  day: number
  slot: number
  mode: Mode
  week: WeekParity
  clashes: Set<Entry>
}

/** The activities of one day/time slot. With "Toate" selected, odd and even weeks are stacked like in the Excel layout. */
export function SlotCell({ entries, day, slot, mode, week, clashes }: Props) {
  const here = entries.filter((e) => e.day === day && e.slot === slot).sort((a, b) => a.week - b.week)
  const card = (e: Entry, i: number) => (
    <EventCard key={i} entry={e} mode={mode} week={week} clash={clashes.has(e)} />
  )

  if (week !== 0) {
    return <div className="cell">{here.filter((e) => isVisible(e, week)).map(card)}</div>
  }
  if (!here.some((e) => e.week)) {
    return <div className="cell">{here.map(card)}</div>
  }

  const half = (parity: 1 | 2) => {
    const items = here.filter((e) => e.week === parity)
    return items.length ? items.map(card) : <div className="freehalf">{strings.weekFree(parity)}</div>
  }

  return (
    <div className="cell split">
      {here.filter((e) => !e.week).map(card)}
      <div className="half">{half(1)}</div>
      <div className="half">{half(2)}</div>
    </div>
  )
}
