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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <path d="M14 3v6h6" />
                <path d="M12 12v6M9 15l3 3 3-3" />
              </svg>
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
