# D.I. Khan Service Finder — Frontend

> **Find the Right Service, Near You.**

D.I. Khan Service Finder is a local service discovery and hiring platform for Dera Ismail Khan, Pakistan. It helps people find trusted plumbers, electricians, mechanics, AC technicians, carpenters, tutors and other local professionals. They can compare them, send service requests, and review completed work.

This repository contains **only the frontend**. It is built to plug into a separate Node.js / Express / MongoDB REST API that follows the [shared API contract](#api-integration).

---

## Tech stack

| Concern     | Choice                                                  |
| ----------- | ------------------------------------------------------- |
| UI          | React 19 (JavaScript, JSX)                              |
| Build/dev   | Vite                                                    |
| Routing     | React Router DOM (data router, lazy-loaded pages)       |
| HTTP        | Axios (one shared instance)                             |
| Icons       | React Icons                                             |
| Styling     | Plain CSS3: design tokens, cascade layers, native nesting |
| Linting     | ESLint (flat config, react-hooks, react-refresh)        |

There's no TypeScript, Tailwind, Bootstrap, Redux or Firebase. State uses React context and hooks. Server state is fetched through service modules.

---

## Getting started

### Prerequisites

- Node.js **20.19+** or **22.12+** (developed on Node 24)
- npm 10+

### Setup

```bash
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

The app runs at <http://localhost:5173>. If that port is busy, Vite picks the next free one and prints it.

### Scripts

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload        |
| `npm run build`   | Production build to `dist/`                 |
| `npm run preview` | Serve the production build locally          |
| `npm run lint`    | Lint all source files                       |

---

## Environment variables

Every variable must be prefixed with `VITE_` to reach the browser. **Never put secrets in these files**, because everything ships to the client.

| Variable            | Default                         | Purpose                                        |
| ------------------- | ------------------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1`  | Backend base URL **including** `/api/v1`       |
| `VITE_API_TIMEOUT`  | `15000`                         | Request timeout (ms)                           |
| `VITE_APP_NAME`     | `D.I. Khan Service Finder`      | App name used in page titles                   |
| `VITE_DEFAULT_CITY` | `dera-ismail-khan`              | Default city slug for searches                 |

Code reads these values through [`src/constants/config.js`](src/constants/config.js) and never touches `import.meta.env` directly.

---

## Project structure

```
src/
├── api/                 # Axios instance + endpoint map (the only place axios is configured)
├── assets/              # Static images/illustrations bundled by Vite
├── components/
│   ├── common/          # Reusable UI: Loader, error/empty states, buttons, inputs, modals…
│   ├── layout/          # Navbar, Footer, sidebars
│   ├── services/        # Category/service cards and lists
│   ├── providers/       # Provider cards, filters, profile sections
│   ├── requests/        # Service-request form, status badges, request lists
│   ├── reviews/         # Rating display, review list, review form
│   └── dashboard/       # Dashboard widgets shared across roles
├── constants/           # Config, routes, roles, request statuses (single sources of truth)
├── context/             # React contexts (e.g. AuthContext)
├── hooks/               # Reusable hooks
├── layouts/             # Root, Main (public), Auth and Dashboard layouts
├── pages/               # One folder per route-level page
├── routes/              # Router definition and route guards
├── services/            # API service modules (authService, providerService, …)
├── utils/               # Pure helpers (storage, API error normalisation, formatting)
├── validations/         # Form validation rules
├── App.jsx              # App root (providers + RouterProvider)
├── main.jsx             # Entry point
└── index.css            # Design tokens, cascade layers, reset, base styles
```

### Routes

| Path                         | Page                       | Access (UI)        |
| ---------------------------- | -------------------------- | ------------------ |
| `/`                          | Home                       | Public             |
| `/services`                  | All services/categories    | Public             |
| `/services/:slug`            | Service details            | Public             |
| `/providers`                 | Provider listing           | Public             |
| `/providers/:id`             | Provider profile           | Public             |
| `/search`                    | Search (URL query driven)  | Public             |
| `/requests/new`              | New service request        | Customer           |
| `/login`, `/register`        | Authentication             | Guests             |
| `/forgot-password`, `/reset-password` | Password recovery | Guests             |
| `/dashboard/customer`        | Customer dashboard         | `customer`         |
| `/dashboard/provider`        | Provider dashboard         | `provider`         |
| `/dashboard/admin`           | Admin dashboard            | `admin`            |
| `*`                          | 404                        | Public             |

Search state lives in the URL so results can be shared and bookmarked, for example:
`/search?q=plumber&category=home-services&city=dera-ismail-khan&page=1&limit=12&sort=rating`

---

## API integration

- **Base URL:** `VITE_API_BASE_URL` (for example `https://api.example.com/api/v1`)
- **Auth header:** `Authorization: Bearer <JWT_TOKEN>`, attached automatically by [`src/api/axiosClient.js`](src/api/axiosClient.js)
- **Endpoints:** defined once in [`src/api/endpoints.js`](src/api/endpoints.js), matching the shared contract (`/auth`, `/providers`, `/services`, `/categories`, `/requests`, `/reviews`, `/users/profile`)
- **Components never call Axios directly.** They use service modules in `src/services/`.

### Response format expected from the backend

```jsonc
// Success
{ "success": true, "message": "…", "data": {} }

// List
{ "success": true, "message": "…", "data": [], "pagination": { "page": 1, "limit": 12, "total": 100, "totalPages": 9 } }

// Error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "phone", "message": "Valid phone number is required" }] }
```

Every failed request becomes an `ApiError` ([`src/utils/apiError.js`](src/utils/apiError.js)) with `message`, `status`, `code` and `errors[]`. That gives the UI one consistent way to show messages and field-level validation errors. Network failures, timeouts and 5xx responses get friendly messages, and raw server internals are never shown.

### Backend notes

- **CORS:** the API must allow the frontend origin (for example `http://localhost:5173` in development).
- **Security:** frontend role checks only control navigation and UI. The backend must enforce every permission.
- **Roles:** the frontend expects `customer`, `provider` and `admin`. Public registration never offers `admin`.

---

## Design system

The global stylesheet [`src/index.css`](src/index.css) defines:

- **Tokens:** a raw palette (Tier 1) and semantic tokens (Tier 2) for colour, type scale, spacing, radii, shadows, z-index and motion. Components use semantic tokens only.
- **Cascade layers:** `reset → base → layout → components → pages → utilities`. Component stylesheets wrap their rules in the matching `@layer`, so specificity stays predictable without `!important`.
- **Accessibility:** visible `:focus-visible` rings, a skip link, 44px touch targets, `rem`-based type that respects user font settings, reduced-motion handling and Windows High Contrast support.
- **Performance:** system font stack (no web-font download) and route-level code splitting.

---

## Development roadmap

| Phase | Scope                                                        | Status       |
| ----- | ------------------------------------------------------------ | ------------ |
| 1     | Foundation: setup, structure, global CSS, routing, env config | ✅ Complete  |
| 2     | Design system: navbar, footer, buttons, inputs, cards, modals, states | ⏳ Next |
| 3     | Homepage                                                     | Planned      |
| 4     | Services, categories, service details, search                | Planned      |
| 5     | Provider listing, filters, provider profile                  | Planned      |
| 6     | Authentication, protected/role-based routes                  | Planned      |
| 7     | Customer dashboard and service requests                      | Planned      |
| 8     | Provider dashboard                                           | Planned      |
| 9     | Admin dashboard                                              | Planned      |
| 10    | Full API integration                                         | Planned      |
| 11    | QA: routing, auth, forms, responsive, console                | Planned      |
