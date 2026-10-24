import { useEffect, useMemo, useState } from 'react'
import { LuSearch, LuTriangleAlert } from 'react-icons/lu'
import { useModel } from '../../context/ScheduleContext'
import { useCalendarGroups } from '../../hooks/useCalendarGroups'
import { useSelection } from '../../hooks/useSelection'
import { findClashes, todayIndex } from '../../lib/schedule'
import { strings } from '../../strings'
import type { Entry } from '../../types'
import { CalendarActions } from './CalendarActions'
import { DayView } from './DayView'
import { Empty } from './Empty'
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
  const { selection, setMode, setWeek, setTeacher, selectGroup, selectYear, selectSpec } =
    useSelection(model)
  const { mode, year, group, teacher, week } = selection

  const calendarGroups = useCalendarGroups()
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
    results = <Empty icon={LuSearch}>{strings.teacherPrompt}</Empty>
  } else {
    results = (
      <>
        <div className="summary">
          <h2>
            {academicTitle && <span className="ttl">{academicTitle} </span>}
            {heading}
          </h2>
          {mode === 'group' && studyYear && <p>{strings.yearSemester(studyYear.y, studyYear.sem)}</p>}
          {mode === 'group' && calendarGroups.has(group) && <CalendarActions group={group} />}
        </div>
        <Legend />
        {clashes.size > 0 && <div className="clashnote">
            <LuTriangleAlert aria-hidden />
            {strings.clashNote(clashes.size)}
          </div>}
        {entries.length === 0 ? (
          <Empty>{strings.nothingFound}</Empty>
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

          <div className="toolbar">
            {mode === 'group' ? (
              <GroupPicker
                selection={selection}
                onSelectGroup={selectGroup}
                onSelectYear={selectYear}
                onSelectSpec={selectSpec}
              />
            ) : (
              <TeacherSearch teacher={teacher} onPick={setTeacher} />
            )}
            <WeekFilter week={week} onChange={setWeek} />
          </div>

          <div>{results}</div>

          <TimetableLinks currentYear={mode === 'group' ? year : null} />
        </div>
      </div>
    </div>
  )
}
