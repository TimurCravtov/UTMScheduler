import { useEffect, useMemo, useState } from 'react'
import { useModel } from '../../context/ScheduleContext'
import { useSelection } from '../../hooks/useSelection'
import { findClashes, todayIndex } from '../../lib/schedule'
import { strings } from '../../strings'
import type { Entry } from '../../types'
import { DayView } from './DayView'
import { GroupPicker } from './GroupPicker'
import { Legend } from './Legend'
import { ModeToggle } from './ModeToggle'
import { ScheduleGrid } from './ScheduleGrid'
import { TeacherSearch } from './TeacherSearch'
import { TimetableLinks } from './TimetableLinks'
import { WeekFilter } from './WeekFilter'
import './Schedule.css'

const NO_CLASHES = new Set<Entry>()

export function Schedule() {
  const model = useModel()
  const { meta } = model
  const { selection, hadStoredGroup, setMode, setWeek, setTeacher, selectGroup, selectYear, selectSpec } =
    useSelection(model)
  const { mode, year, group, teacher, week } = selection

  const today = todayIndex()
  const [day, setDay] = useState(Math.max(today, 0))

  useEffect(() => {
    document.title = meta.title
  }, [meta.title])

  const entries = useMemo(() => model.getEntries(mode, group, teacher), [model, mode, group, teacher])
  const clashes = useMemo(() => (mode === 'teacher' ? findClashes(entries) : NO_CLASHES), [mode, entries])

  const heading = mode === 'group' ? group : teacher ? model.displayName(teacher) : ''
  const academicTitle = mode === 'teacher' && teacher ? model.getTitle(teacher) : undefined
  const studyYear = model.findYear(year)

  let results
  if (mode === 'teacher' && !teacher) {
    results = <div className="empty">{strings.teacherPrompt}</div>
  } else {
    results = (
      <>
        <div className="summary">
          <h2>
            {academicTitle && <span className="ttl">{academicTitle} </span>}
            {heading}
          </h2>
          {mode === 'group' && studyYear && <p>{strings.yearSemester(studyYear.y, studyYear.sem)}</p>}
        </div>
        <Legend />
        {clashes.size > 0 && <div className="clashnote">{strings.clashNote(clashes.size)}</div>}
        {entries.length === 0 ? (
          <div className="empty">{strings.nothingFound}</div>
        ) : (
          <>
            <ScheduleGrid entries={entries} mode={mode} week={week} clashes={clashes} today={today} />
            <DayView
              entries={entries}
              mode={mode}
              week={week}
              clashes={clashes}
              today={today}
              day={day}
              onDayChange={setDay}
            />
          </>
        )}
      </>
    )
  }

  return (
    <div className="orar">
      <div className="app">
        <div className="wrap">
          <header className="top">
            <div>
              <h1>{meta.title}</h1>
              {meta.subtitle && <p className="sub">{meta.subtitle}</p>}
            </div>
            <ModeToggle mode={mode} onChange={setMode} />
          </header>

          <GroupPicker
            hidden={mode !== 'group'}
            selection={selection}
            initiallyClosed={hadStoredGroup}
            onSelectGroup={selectGroup}
            onSelectYear={selectYear}
            onSelectSpec={selectSpec}
          />
          {mode === 'teacher' && <TeacherSearch teacher={teacher} onPick={setTeacher} />}

          <WeekFilter week={week} onChange={setWeek} />

          <div>{results}</div>

          <TimetableLinks currentYear={mode === 'group' ? year : null} />
        </div>
      </div>
    </div>
  )
}
