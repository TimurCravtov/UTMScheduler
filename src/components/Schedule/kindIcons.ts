import type { IconType } from 'react-icons'
import { LuBookOpen, LuFlaskConical, LuLightbulb, LuMessagesSquare } from 'react-icons/lu'
import type { Kind } from '../../types'

/** One icon per activity kind; together with the accent colour they tell the kinds apart at a glance. */
export const KIND_ICON: Record<Kind, IconType> = {
  curs: LuBookOpen,
  sem: LuMessagesSquare,
  lab: LuFlaskConical,
  proiect: LuLightbulb,
}
