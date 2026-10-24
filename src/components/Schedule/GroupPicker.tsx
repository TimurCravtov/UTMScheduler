import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { LuCalendarDays, LuChevronDown, LuLayers, LuSearch, LuUsers } from 'react-icons/lu'
import { useModel } from '../../context/ScheduleContext'
import { strings } from '../../strings'
import type { Selection } from '../../types'

interface Props {
  selection: Selection
  onSelectGroup: (year: string, group: string) => void
  onSelectYear: (year: string) => void
  onSelectSpec: (spec: string) => void
}

/** A chip showing the current group; opens a popover with search, year, specialty and group. */
export function GroupPicker({ selection, onSelectGroup, onSelectYear, onSelectSpec }: Props) {
  const model = useModel()
  const panelId = useId()
  const specId = useId()
  const groupId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const year = model.findYear(selection.year)!
  const specs = model.specsOf(year)
  const groups = model.groupsOf(year, selection.spec)
  const searching = /[a-z0-9]/i.test(query)
  const hits = useMemo(() => model.searchGroups(query), [model, query])

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function pickGroup(y: string, g: string) {
    onSelectGroup(y, g)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="groupmenu" ref={rootRef}>
      <button
        type="button"
        className="groupchip"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        title={strings.changeGroup}
        onClick={() => setOpen((o) => !o)}
      >
        <LuUsers aria-hidden />
        <b>{selection.group}</b>
        <small>{strings.yearOption(year.y)}</small>
        <LuChevronDown aria-hidden className="caret" />
      </button>

      {open && (
        <div className="popover" id={panelId} role="dialog" aria-label={strings.changeGroup}>
          <div className="gsearch">
            <LuSearch aria-hidden />
            <input
              type="search"
              value={query}
              placeholder={strings.groupSearchPlaceholder}
              aria-label={strings.groupSearchLabel}
              autoComplete="off"
              inputMode="search"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hits[0]) pickGroup(hits[0].year, hits[0].group)
              }}
            />
            {searching && (
              <div className="gresults">
                {hits.length ? (
                  hits.map((h) => (
                    <button type="button" key={h.group} onClick={() => pickGroup(h.year, h.group)}>
                      {h.group}
                      <small>{strings.yearOfHit(h.year)}</small>
                    </button>
                  ))
                ) : (
                  <div className="none">{strings.noGroupFound}</div>
                )}
              </div>
            )}
          </div>

          <div className="pickfield">
            <span className="pf-label">
              <LuCalendarDays aria-hidden />
              {strings.yearStep}
            </span>
            <div className="seg" role="group" aria-label={strings.yearsLabel}>
              {model.data.years.map((y) => (
                <button
                  type="button"
                  key={y.y}
                  aria-label={strings.yearOption(y.y)}
                  aria-pressed={y.y === selection.year}
                  onClick={() => onSelectYear(y.y)}
                >
                  {y.y}
                </button>
              ))}
            </div>
          </div>

          <div className="pickfield">
            <label className="pf-label" htmlFor={specId}>
              <LuLayers aria-hidden />
              {strings.specialty}
            </label>
            <select id={specId} value={selection.spec} onChange={(e) => onSelectSpec(e.target.value)}>
              {specs.map((s) => (
                <option key={s} value={s}>
                  {s} ({model.groupsOf(year, s).length})
                </option>
              ))}
            </select>
          </div>

          <div className="pickfield">
            <label className="pf-label" htmlFor={groupId}>
              <LuUsers aria-hidden />
              {strings.group}
            </label>
            <select id={groupId} value={selection.group} onChange={(e) => pickGroup(selection.year, e.target.value)}>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
