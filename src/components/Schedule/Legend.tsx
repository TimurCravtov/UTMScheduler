import { strings } from '../../strings'
import type { Kind } from '../../types'
import { KIND_ICON } from './kindIcons'

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
      {ITEMS.map(([kind, color]) => {
        const Icon = KIND_ICON[kind]
        return (
          <span key={kind}>
            <Icon style={{ color: `var(${color})` }} aria-hidden />
            {strings.kind[kind]}
          </span>
        )
      })}
    </div>
  )
}
