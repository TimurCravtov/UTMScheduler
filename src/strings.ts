import type { Kind, WeekParity } from './types'

/** All interface text (Romanian), kept out of the components. Timetable content itself comes from the data file. */
export const strings = {
  loading: 'Se încarcă orarul…',
  loadError: (message: string) => `Orarul nu a putut fi încărcat (${message}).`,

  viewMode: 'Mod de vizualizare',
  modeGroup: 'Grupă',
  modeTeacher: 'Profesor',

  group: 'Grupa',
  changeGroup: 'Schimbă grupa',
  closePicker: 'Închide',
  groupSearchPlaceholder: 'Caută grupa, ex. TI-241 sau 241',
  groupSearchLabel: 'Caută grupa',
  noGroupFound: 'Nicio grupă găsită',
  yearOfHit: (year: string) => `anul ${year}`,
  yearStep: 'Anul',
  yearOption: (year: string) => `Anul ${year}`,
  yearsLabel: 'Anul de studii',
  specialty: 'Specialitatea',

  teacher: 'Profesor',
  teacherPlaceholder: 'Scrie numele, de ex. Rusu',
  noTeacherFound: 'Niciun profesor cu acest nume',
  teacherPrompt: 'Scrie numele profesorului în câmpul de mai sus ca să vezi cu ce grupe are ore.',

  weekLabel: 'Săptămâna',
  weekOptions: ['Toate', 'Impară', 'Pară'] as const,
  currentWeekMark: 'Săptămâna curentă',
  /** Adjective for each parity value (index 0 is unused). */
  parityName: ['', 'impară', 'pară'] as readonly string[],
  currentWeek: (n: number) => `săptămâna ${n}`,
  currentWeekPrefix: 'Acum este',
  outsideSemester: 'În afara perioadei de cursuri',

  yearSemester: (year: string, sem: string) => `Anul ${year}, semestrul ${sem}.`,
  clashNote: (count: number) =>
    `Atenție: ${count} activități se suprapun în același interval, în săli diferite. Sunt marcate cu roșu.`,
  nothingFound: 'Nu am găsit activități pentru această selecție.',
  nothingToday: 'Nicio activitate în această zi.',

  hours: 'Ora',
  dayTabs: 'Ziua',
  onlyInWeek: (week: WeekParity) => `Doar în săptămâna ${strings.parityName[week]}`,
  weekTag: (week: WeekParity) => `săpt. ${strings.parityName[week]}`,
  weekFree: (week: WeekParity) => `săpt. ${strings.parityName[week]}: liber`,
  roomPrefix: 'sala ',

  fullTimetable: 'Orarul complet',
  fullTimetableIn: (format: string) => `Orarul complet în format ${format}`,
  semester: (sem: string) => `sem. ${sem}`,
  genericFile: 'fișier',

  kind: {
    curs: 'Curs',
    lab: 'Laborator',
    sem: 'Seminar / practică',
    proiect: 'Proiect',
  } satisfies Record<Kind, string>,
}
