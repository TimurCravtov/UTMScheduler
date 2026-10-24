import { strings } from '../../strings'
import type { Mode } from '../../types'

interface Props {
  mode: Mode
  onChange: (mode: Mode) => void
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mode" role="group" aria-label={strings.viewMode}>
      <button type="button" aria-pressed={mode === 'group'} onClick={() => onChange('group')}>
        {strings.modeGroup}
      </button>
      <button type="button" aria-pressed={mode === 'teacher'} onClick={() => onChange('teacher')}>
        {strings.modeTeacher}
      </button>
    </div>
  )
}
