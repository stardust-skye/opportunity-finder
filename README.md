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
  context/     Theme preference and system-theme initialization
  data/        Local mock opportunities
  pages/       Landing, Explore, opportunity details, sign in, and registration routes
  styles.css   Tailwind layers and theme-aware responsive design system
```

## Routes

- `/` — landing page and featured opportunities
- `/opportunities` — searchable, filterable, and sortable sample listings
- `/opportunities/:id` — opportunity description and mock application/contact link
- `/login` — frontend-only sign-in form
- `/register` — frontend-only account registration form

Dark and light mode preferences are saved in browser local storage. With no saved choice, the app starts with the operating system's preferred color scheme. Only Student and Professor account types are offered, and both require an NC State email address. Professor publishing permissions must be verified separately. No authentication, account creation, database, or API calls are implemented.
