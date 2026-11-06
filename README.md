# Opportunity Finder

An opportunity discovery experience for the NC State community. The repository contains a React frontend and a separate Express/PostgreSQL API.

The frontend uses the backend API for accounts, sessions, professor verification, and opportunities. PostgreSQL is the source of truth; the browser stores only the theme preference. Old localStorage demo accounts and listings are no longer read or migrated.

## Getting started

Requirements: Node.js 20.19+ or 22.12+.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Start PostgreSQL and the backend as described below, then open `http://localhost:5173`. The frontend defaults to `http://localhost:3001`; set `VITE_API_BASE_URL` in the root `.env` to change it, then restart Vite. It is a public build-time setting, not a secret. Use the same hostname (`localhost`, not `127.0.0.1`) for both services, and configure the backend's `FRONTEND_ORIGIN` to match the browser origin exactly. To create or preview a production build:

```powershell
npm run build
npm run preview
```

## Frontend structure

```text
src/
  components/  Shared navigation, cards, buttons, filters, and form pieces
  context/     Theme, server session, and opportunity state
  data/        Filter options and seed data
  services/    API client and backend-to-UI opportunity mapping
  pages/       Landing, Explore, opportunity details, professor workspace, and auth routes
  styles.css   Tailwind layers and theme-aware responsive design system
```

## Routes

- `/` — landing page and featured opportunities
- `/opportunities` — searchable, filterable, and sortable open listings
- `/opportunities/:id` — opportunity description and application/contact link
- `/professor/dashboard` — professor publishing verification and opportunity management
- `/professor/opportunities/new` — create an opportunity
- `/professor/opportunities/:id/edit` — edit a professor-created opportunity
- `/login` — server-backed sign-in form
- `/register` — account registration form

## Authentication and verification

Register a Student or Professor with an `@ncsu.edu` address and a password of at least eight characters, then sign in. The backend sets an HttpOnly session cookie, restores the session on refresh, and checks role, verification, and ownership on every protected API request. Professors start unverified; they may view their dashboard, but publishing and management require verification by a trusted administrator. There is no self-verification control. The address format alone does not prove email ownership or university affiliation.

Existing browser-only demo records are not imported, since their identities and ownership cannot be trusted. They remain in browser storage until manually removed; they do not affect the application. Search, filters and sorting currently operate client-side after loading all pages of open listings.

## Backend and PostgreSQL setup

The API is in `backend/`; it runs independently from Vite. Install PostgreSQL separately (or use an existing local PostgreSQL instance). Create a dedicated database and a database user with permission to create tables and apply migrations. Do not use a production database for development or tests. Set the database password through your PostgreSQL administration tool, and URL-encode special characters in the connection URL.

In PowerShell:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` with the PostgreSQL connection URL, the exact frontend origin, and a unique random session secret of at least 32 characters. Generate a secret locally, for example:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The API listens on port 3001 by default. `db:migrate` applies the checked-in migration, including the PostgreSQL session table. The seed explicitly requires `NODE_ENV=development`; never point it at a production database. It creates the two demo users below plus seven sample listings and their non-login sample professor owners. It is idempotent and does not reset existing users, passwords, verification, or listings. The repository has nine frontend samples; the first seven are used for this seed.

| Backend development account | Email | Password |
| --- | --- | --- |
| Student | `student@ncsu.edu` | `DemoPass123!` |
| Professor | `professor@ncsu.edu` | `DemoPass123!` |

These are predictable **development-only** credentials. The backend demo professor starts unverified. Development seed accounts are not automatically created at server startup and must never be seeded into production.

### Professor verification

There is no public verification endpoint. A trusted database administrator must first verify the person's affiliation through an independent process, then update the specific professor using a restricted database-admin account. For example, in `psql`, replace the email after confirming it identifies the intended account:

```sql
UPDATE "User"
SET "professorVerified" = true, "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'professor@ncsu.edu' AND "role" = 'PROFESSOR'
RETURNING "id", "email", "professorVerified";
```

Use `false` to revoke access. The API reloads the account from PostgreSQL on each authenticated request, so changes apply to existing sessions on the next request. Restrict and audit administrative database access. Registration validates the email format but does not prove email ownership or university affiliation.

### API contract

All responses are JSON: success uses `{ "data": ... }`; errors use `{ "error": { "message": "...", "details": [...] } }` (details appear for validation errors). Lists also include `pagination` with `page`, `limit`, `total`, and `totalPages`. Pages start at 1; limits are 1–100, default 20. IDs are UUIDs. Send `Content-Type: application/json` for all POST, PUT, PATCH and DELETE requests, including logout and delete (send `{}`).

| Method and path | Access | Body / query |
| --- | --- | --- |
| `POST /api/auth/register` | Public | `{ "fullName", "email", "password", "role" }`; role is `STUDENT` or `PROFESSOR` |
| `POST /api/auth/login` | Public | `{ "email", "password" }`; saves a server-side session |
| `POST /api/auth/logout` | Public | `{}`; destroys the session and clears the cookie |
| `GET /api/auth/me` | Signed in | Current user and verification status |
| `GET /api/opportunities` | Public | Optional `search`, `category`, `page`, `limit`; open listings only |
| `GET /api/opportunities/:id` | Public | Open listing details |
| `GET /api/professor/opportunities` | Professor | Own open and closed listings; optional `page`, `limit`; unverified professors may view |
| `POST /api/professor/opportunities` | Verified professor | Listing body below; owner comes from the session |
| `PUT /api/professor/opportunities/:id` | Verified owner | Full listing body below |
| `PATCH /api/professor/opportunities/:id/status` | Verified owner | `{ "status": "OPEN" }` or `{ "status": "CLOSED" }` |
| `DELETE /api/professor/opportunities/:id` | Verified owner | `{}` |

Example listing body:

```json
{
  "title": "Explore robotics",
  "description": "Work with a research team.",
  "category": "Robotics",
  "department": "Engineering",
  "opportunityType": "Research Assistantship",
  "requiredSkills": ["Python"],
  "qualifications": ["Curiosity"],
  "responsibilities": ["Analyze results"],
  "deadline": "2099-12-31",
  "applicationUrl": null,
  "contactEmail": "professor@ncsu.edu"
}
```

Optional listing fields are `location`, `commitment`, `objectives` (array of strings), and `applicationInstructions`. `applicationUrl` must be HTTP(S), or null. PUT replaces optional fields when omitted. Inputs reject unknown fields, including user-supplied owner or verification flags. Closed listings are visible only in the owning professor's list. Authenticated browser clients must use `credentials: "include"`; Postman can retain the cookie in its cookie jar. A `401` means sign-in is required, `403` means insufficient permission or disallowed origin, `404` hides absent/non-owned listings, `409` indicates a duplicate account, and `400` indicates validation failure.

### Security and deployment

Passwords are hashed with bcrypt; its 72-byte input limit is enforced. Sessions are regenerated on login and stored in PostgreSQL, not localStorage. Cookies are HttpOnly and SameSite=Lax, and Secure in production. Configure a strong `SESSION_SECRET` via environment variables, use HTTPS, set `NODE_ENV=production`, and use an HTTPS `FRONTEND_ORIGIN`. The frontend and API must be same-site for the Lax cookie; use the same hostname locally (e.g. `localhost` for both). If and only if deployed behind exactly one trusted TLS-terminating proxy, set `TRUST_PROXY=1`. Restrict access to PostgreSQL and use TLS as appropriate.

Unsafe requests require JSON and reject an `Origin` other than the configured frontend origin; CORS permits credentials only for that origin. Authentication endpoints have a per-process IP rate limit. For multiple instances, use a shared rate-limit store and configure the precise proxy topology before production deployment. This MVP still needs a verified email workflow, operational monitoring, backup/recovery, and deployment-specific security review.

### Automated tests

Run `npm test` from the repository root for frontend API-service and mapping tests.
The backend integration tests require PostgreSQL:

Create a separate empty PostgreSQL database whose name ends in `_test`. Apply migrations to it, then run:

```powershell
cd backend
$env:DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/opportunity_finder_test"
npm run db:migrate
$env:TEST_DATABASE_URL = $env:DATABASE_URL
npm test
```

Tests create uniquely named accounts and listings and clean up their own records. They exercise real PostgreSQL and session storage; they do not mock authentication or authorization. Supply the test database URL in your shell rather than committing credentials.
