import { LuFileDown } from 'react-icons/lu'
import { useModel } from '../../context/ScheduleContext'
import { strings } from '../../strings'

interface Props {
  /** Study year to highlight, if any. */
  currentYear: string | null
}

const formatOf = (url: string) =>
  /\.pdf(\?|#|$)/i.test(url) ? 'PDF' : /\.xlsx?(\?|#|$)/i.test(url) ? 'Excel' : strings.genericFile

/** Download buttons for the full per-year timetable files. */
export function TimetableLinks({ currentYear }: Props) {
  const { data, meta } = useModel()
  const links = data.years
    .map((year) => ({ year, url: meta.timetableLinks[year.y] }))
    .filter((l): l is { year: typeof l.year; url: string } => !!l.url)
  if (!links.length) return null

  const formats = [...new Set(links.map((l) => formatOf(l.url)))]
  const heading =
    formats.length === 1 && formats[0] !== strings.genericFile
      ? strings.fullTimetableIn(formats[0])
      : strings.fullTimetable

  return (
    <section className="xl">
      <h3>{heading}</h3>
      <div className="xlbtns">
        {links.map(({ year, url }) => {
          const format = formatOf(url)
          return (
            <a
              key={year.y}
              href={url}
              download={format === 'PDF' ? undefined : ''}
              target="_blank"
              rel="noopener noreferrer"
              className={year.y === currentYear ? 'cur' : ''}
            >
              <LuFileDown aria-hidden />
              {strings.yearOption(year.y)}{' '}
              <small>
                {strings.semester(year.sem)} · {format}
              </small>
            </a>
          )
        })}
      </div>
    </section>
  )
}
