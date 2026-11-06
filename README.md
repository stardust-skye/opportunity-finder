# Opportunity Finder

An opportunity discovery experience for the NC State community. This frontend is a static React application with realistic sample opportunities; account forms and professor publishing are previews only.

## Getting started

Requirements: Node.js 20.19+ or 22.12+.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. To create or preview a production build:

```powershell
npm run build
npm run preview
```

## Frontend structure

```text
src/
  components/  Shared navigation, cards, buttons, filters, and form pieces
  context/     Theme, opportunity state, and mock professor verification
  data/        Mock listings and the localStorage opportunity-store adapter
  pages/       Landing, Explore, opportunity details, professor workspace, and auth routes
  styles.css   Tailwind layers and theme-aware responsive design system
```

## Routes

- `/` — landing page and featured opportunities
- `/opportunities` — searchable, filterable, and sortable sample listings
- `/opportunities/:id` — opportunity description and mock application/contact link
- `/professor/dashboard` — professor publishing verification and opportunity management
- `/professor/opportunities/new` — create an opportunity
- `/professor/opportunities/:id/edit` — edit a professor-created opportunity
- `/login` — frontend-only sign-in form
- `/register` — frontend-only account registration form

Dark and light mode preferences, professor-created opportunities, and the mock verification preview are saved in browser local storage. The professor dashboard is available without authentication as a Day 3 preview; new listings can only be published after switching the mock professor to verified. Only Student and Professor account types are offered, and both require an NC State email address. The localStorage adapter is isolated from page components so a future API can replace it. No authentication, real verification, database, or API calls are implemented.
