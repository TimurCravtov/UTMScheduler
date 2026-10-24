import { useId, useMemo, useState } from 'react'
import { useModel } from '../../context/ScheduleContext'
import { strings } from '../../strings'
import type { Selection } from '../../types'

interface Props {
  hidden: boolean
  selection: Selection
  /** Collapse the picker on mobile when a group was already chosen on a previous visit. */
  initiallyClosed: boolean
  onSelectGroup: (year: string, group: string) => void
  onSelectYear: (year: string) => void
  onSelectSpec: (spec: string) => void
}

/** One compact row: search, year, specialty and group. Collapsible on mobile. */
export function GroupPicker({ hidden, selection, initiallyClosed, onSelectGroup, onSelectYear, onSelectSpec }: Props) {
  const model = useModel()
  const bodyId = useId()
  const specId = useId()
  const groupId = useId()
  const [closed, setClosed] = useState(initiallyClosed)
  const [query, setQuery] = useState('')

  const year = model.findYear(selection.year)!
  const specs = model.specsOf(year)
  const groups = model.groupsOf(year, selection.spec)
  const searching = /[a-z0-9]/i.test(query)
  const hits = useMemo(() => model.searchGroups(query), [model, query])

  function pickGroup(y: string, g: string) {
    onSelectGroup(y, g)
    setQuery('')
    setClosed(true)
  }

  return (
    <section className={`controls picker${closed ? ' closed' : ''}`} hidden={hidden}>
      <div className="pickhead">
        <div>
          <span className="pk-label">{strings.group}</span>
          <b>{selection.group}</b> <span className="pk-year">{strings.yearOption(year.y)}</span>
        </div>
        <button
          type="button"
          className="btn-change"
          aria-expanded={!closed}
          aria-controls={bodyId}
          onClick={() => setClosed((c) => !c)}
        >
          {closed ? strings.changeGroup : strings.closePicker}
        </button>
      </div>
      <div className="pickbody" id={bodyId}>
        <div
          className="gsearch"
          // close the results when focus leaves the search box and its results
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setQuery('')
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
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
              if (e.key === 'Escape') setQuery('')
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
          <span>{strings.yearStep}</span>
          <div className="seg" role="group" aria-label={strings.yearsLabel}>
            {model.data.years.map((y) => (
              <button
                type="button"
                key={y.y}
                aria-label={strings.yearOption(y.y)}
                aria-pressed={y.y === selection.year}
                onClick={() => {
                  if (y.y === selection.year) return
                  onSelectYear(y.y)
                  setClosed(false)
                }}
              >
                {y.y}
              </button>
            ))}
          </div>
        </div>

        <div className="pickfield">
          <label htmlFor={specId}>{strings.specialty}</label>
          <select
            id={specId}
            value={selection.spec}
            onChange={(e) => {
              onSelectSpec(e.target.value)
              setClosed(false)
            }}
          >
            {specs.map((s) => (
              <option key={s} value={s}>
                {s} ({model.groupsOf(year, s).length})
              </option>
            ))}
          </select>
        </div>

        <div className="pickfield">
          <label htmlFor={groupId}>{strings.group}</label>
          <select id={groupId} value={selection.group} onChange={(e) => pickGroup(selection.year, e.target.value)}>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
