import { useEffect, useState } from 'react'
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        {strings.addToCalendar}
      </a>
      <button type="button" onClick={copyLink} aria-live="polite">
        {copied ? strings.linkCopied : strings.copyCalendarLink}
      </button>
    </div>
  )
}
