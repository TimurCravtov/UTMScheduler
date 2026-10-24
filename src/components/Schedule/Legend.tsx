import { strings } from '../../strings'
import type { Kind } from '../../types'

/** [kind, CSS variable holding its colour] in display order. */
const ITEMS: [Kind, string][] = [
  ['curs', '--curs'],
  ['sem', '--sem'],
  ['lab', '--lab'],
  ['proiect', '--proj'],
]

export function Legend() {
  return (
    <div className="legend">
      {ITEMS.map(([kind, color]) => (
        <span key={kind}>
          <i style={{ background: `var(${color})` }} />
          {strings.kind[kind]}
        </span>
      ))}
    </div>
  )
}
