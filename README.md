# UTM Scheduler

The FCIM timetable widget from <https://fcim.utm.md/orar-sectia-zi-2/>, rebuilt as a React + TypeScript + Vite app.

## Running

```bash
npm install
npm run dev
```

## Data

Nothing about the timetable is hardcoded in the source. The app fetches `public/data/schedule.json` at runtime
(override the URL with `VITE_SCHEDULE_DATA_URL`).

`npm run sync` regenerates that file by scraping the live page: schedule records, teachers, title, subtitle,
semester dates, week notes and the PDF links. Pass another page with `npm run sync -- <url>` or `SCHEDULE_SOURCE_URL`.

Interface text (Romanian) lives in `src/strings.ts`.

## Layout

- `scripts/sync.mjs` – scraper
- `src/lib/schedule.ts` – pure logic (`createModel`, clash detection, week parity)
- `src/hooks/` – data loading, persisted selection
- `src/components/Schedule/` – UI components and `Schedule.css` (scoped under `.orar`)

## Calendars (.ics)

`npm run ics` writes one iCalendar file per group to `public/ics/<group>.ics` (served at `/ics/<group>.ics`), plus
`public/ics/index.json` listing the groups that have one. Each activity is a weekly recurring event, every second week
for odd/even-week activities, from the semester start to its end. The groups are listed in `scripts/ics-groups.json`;
pass others on the command line: `npm run ics -- FAF-231 SI-261`.

In the app, groups with a calendar get an "Adaugă în calendar" download and a "Copiază linkul de abonare" button.
Importing the file is a one-time snapshot; subscribing to the link keeps the calendar up to date.

## Deployment

`.github/workflows/deploy.yml` re-scrapes the timetable (`npm run sync`), rebuilds and deploys to GitHub Pages every
6 hours, on pushes to `main`, and on demand. If the scrape fails the job fails and the previous deployment stays up.
Enable it under Settings → Pages → Source: GitHub Actions. The build reads `BASE_PATH` (set by the workflow) so assets
load from `/<repo>/`.
