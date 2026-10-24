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
