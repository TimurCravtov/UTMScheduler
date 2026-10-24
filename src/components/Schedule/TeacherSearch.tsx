import { useId, useMemo, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { useModel } from '../../context/ScheduleContext'
import { strings } from '../../strings'

interface Props {
  teacher: string | null
  onPick: (teacher: string) => void
}

/** Type-ahead teacher picker (ARIA combobox). */
export function TeacherSearch({ teacher, onPick }: Props) {
  const model = useModel()
  const listId = useId()
  const [query, setQuery] = useState(() => (teacher ? model.displayName(teacher) : ''))
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const items = useMemo(() => model.searchTeachers(query), [model, query])

  function pick(t: string) {
    setQuery(model.displayName(t))
    setOpen(false)
    onPick(t)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') return setOpen(false)
    if (!items.length) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length)
    } else if (e.key === 'Enter' && open) {
      e.preventDefault()
      pick(items[active])
    }
  }

  return (
    <div className="tsearch">
      <LuSearch aria-hidden />
      <input
        type="search"
        value={query}
        placeholder={strings.teacherPlaceholder}
        aria-label={strings.teacher}
        autoComplete="off"
        autoFocus={!teacher}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && items.length ? `${listId}-${active}` : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
      />
      <div className={`tlist${open ? ' open' : ''}`} id={listId} role="listbox">
        {items.length ? (
          items.map((t, i) => {
            const title = model.getTitle(t)
            return (
              <button
                type="button"
                role="option"
                key={t}
                id={`${listId}-${i}`}
                aria-selected={i === active}
                className={i === active ? 'act' : ''}
                tabIndex={-1}
                // mousedown (not click) so the input keeps focus and doesn't close the list first
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(t)
                }}
              >
                {model.displayName(t)}
                {title && <small>{title}</small>}
              </button>
            )
          })
        ) : (
          <div className="none">{strings.noTeacherFound}</div>
        )}
      </div>
    </div>
  )
}
