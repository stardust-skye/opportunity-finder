# Opportunity Finder

An opportunity discovery experience for the NC State community. This static React application includes sample opportunities and a temporary, browser-only authentication and publishing demo.

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
  context/     Theme, demo authentication, and opportunity state
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

## Demo authentication and verification

Register a Student or Professor with an `@ncsu.edu` address and a password of at least eight characters, then sign in. Accounts and sessions exist only in the current browser's localStorage. Passwords are stored as salted PBKDF2-SHA-256 hashes (210,000 iterations), not plaintext. Web Crypto requires HTTPS or localhost. This does **not** prove email ownership or university affiliation.

When running the Vite development server (`npm run dev`), the following accounts are available on first sign-in:

| Account | Email | Password |
| --- | --- | --- |
| Student | `student@ncsu.edu` | `DemoPass123!` |
| Professor | `professor@ncsu.edu` | `DemoPass123!` |

These are development-only demo credentials, not production authentication. Newly registered professors and the demo professor start unverified. In development only, a clearly labeled dashboard control previews verified access for the current professor account; it is **not** real university verification. Production builds omit both the demo login accounts and this preview control. There is no real verification workflow in this frontend.

Professor routes require a demo professor session. Unverified professors can see their dashboard but cannot manage listings; verified professors can manage only their own listings. New listings store the demo account ID as their owner. Listings created before accounts were introduced remain in localStorage and visible in Explore, but have no trustworthy owner and therefore cannot be edited or deleted from an account dashboard. Dark and light mode preferences and opportunity data remain local to the browser.

**Security limitation:** This is not secure authentication or authorization. Browser storage and client-side roles, verification, hashes, and guards can all be inspected or modified by the user; hashes can be attacked offline. Never use real passwords or sensitive data. A backend must implement real authentication, email and professor verification, ownership, and authorization before deployment. No backend, database, or API is implemented.
