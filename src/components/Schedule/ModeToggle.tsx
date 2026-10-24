import { LuGraduationCap, LuUsers } from 'react-icons/lu'
import { strings } from '../../strings'
import type { Mode } from '../../types'

interface Props {
  mode: Mode
  onChange: (mode: Mode) => void
}

/** Group / teacher switch. The labels are hidden on small screens, leaving just the icons. */
export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mode" role="group" aria-label={strings.viewMode}>
      <button
        type="button"
        aria-pressed={mode === 'group'}
        aria-label={strings.modeGroup}
        title={strings.modeGroup}
        onClick={() => onChange('group')}
      >
        <LuUsers aria-hidden />
        <span className="lbl">{strings.modeGroup}</span>
      </button>
      <button
        type="button"
        aria-pressed={mode === 'teacher'}
        aria-label={strings.modeTeacher}
        title={strings.modeTeacher}
        onClick={() => onChange('teacher')}
      >
        <LuGraduationCap aria-hidden />
        <span className="lbl">{strings.modeTeacher}</span>
      </button>
    </div>
  )
}
