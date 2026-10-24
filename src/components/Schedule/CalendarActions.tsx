import { useEffect, useState } from 'react'
import { LuCalendarPlus, LuCheck, LuLink } from 'react-icons/lu'
import { calendarPath } from '../../hooks/useCalendarGroups'
import { strings } from '../../strings'

interface Props {
  group: string
}

/** Download the group's .ics, or copy its URL to subscribe from a calendar app. */
export function CalendarActions({ group }: Props) {
  const [copied, setCopied] = useState(false)
  const path = calendarPath(group)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  function copyLink() {
    const url = new URL(path, window.location.href).href
    navigator.clipboard?.writeText(url).then(
      () => setCopied(true),
      () => {
        // clipboard blocked: nothing to do, the download button still works
      },
    )
  }

  return (
    <div className="calactions">
      <a href={path} download={`${group}.ics`}>
        <LuCalendarPlus aria-hidden />
        {strings.addToCalendar}
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? strings.linkCopied : strings.copyCalendarLink}
        title={copied ? strings.linkCopied : strings.copyCalendarLink}
      >
        {copied ? <LuCheck aria-hidden /> : <LuLink aria-hidden />}
      </button>
    </div>
  )
}
