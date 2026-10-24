import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { LuCalendarOff } from 'react-icons/lu'

interface Props {
  children: ReactNode
  icon?: IconType
  className?: string
}

/** Placeholder for "nothing to show" states. */
export function Empty({ children, icon: Icon = LuCalendarOff, className = 'empty' }: Props) {
  return (
    <div className={className}>
      <Icon aria-hidden />
      <span>{children}</span>
    </div>
  )
}
