# Project Management — Client

React SPA frontend. NestJS backend lives in the sibling `server` folder/repo.

## Stack

- **Framework:** React 19 + Vite 8 (Rolldown) + TypeScript, React Compiler enabled
- **Styling / components:** Tailwind CSS v4 + shadcn/ui (Base UI primitives, Nova preset) + `next-themes` for light/dark/system theming
- **State management:** Redux Toolkit — `createApi` (RTK Query) for server state, a plain slice for the auth session
- **Routing:** React Router (data mode — `createBrowserRouter`)
- **Forms & validation:** React Hook Form + Zod
- **Drag-and-drop (Kanban board):** dnd-kit
- **Real-time:** socket.io-client
- **Auth:** `@simplewebauthn/browser` (passkeys) + password fallback, matching the backend
- **Linting:** ESLint (Vite default + `typescript-eslint` + `react-hooks` + `react-refresh`)

## Prerequisites

- Node.js **24.19+** (LTS)
- npm **12+**
- The `server` app running locally (see `../server/README.md`) — this app talks to it over HTTP

## First-time setup

```bash
npm install
cp .env.example .env
```

## Running the app

```bash
npm run dev       # Vite dev server, http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build locally
```

## Environment variables

| Var            | Purpose                                                     |
| -------------- | ----------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the backend API, including its `/api/v1` prefix |

## Auth model

- Access token lives **in the Redux store's in-memory state only** (`features/auth/auth-slice.ts`), never in `localStorage`/`sessionStorage` — this keeps it out of reach of an XSS payload reading disk-backed storage.
- The refresh token is an httpOnly cookie set by the backend; this app never reads it directly, only relies on the browser sending it back on `POST /auth/refresh`.
- Since the access token is memory-only, a hard page reload loses it — `SessionBootstrap` (`src/app/session-bootstrap.tsx`) silently fires the `refresh` mutation once on app start to trade the cookie for a fresh access token before rendering anything that depends on auth state.
- `baseQueryWithReauth` (`src/lib/base-query.ts`) wraps RTK Query's `fetchBaseQuery`: on a `401` it triggers `/auth/refresh` and retries the original request once, using an `async-mutex` lock (RTK Query's documented pattern for this) so concurrent requests that 401 at the same moment don't each independently race the backend's refresh-token rotation.

## Project structure

Feature-based layout, mirroring the backend's `modules` convention:

```
src/
  app/                    # router, route guards, app-wide bootstrapping, Redux store
    store.ts
    hooks.ts               # typed useAppDispatch / useAppSelector
    router.tsx
    protected-route.tsx
    session-bootstrap.tsx
  components/ui/          # shadcn/ui primitives (owned code, not a library — edit freely)
  features/               # one folder per domain
    auth/
      auth-slice.ts         # session state (access token, current user)
      auth-api.ts           # RTK Query endpoints (login/register/refresh/logout)
      pages/
    dashboard/
    workspaces/
    projects/
    tasks/
    comments/
    subtasks/
    attachments/
    activity-log/
  lib/                    # cross-cutting: base RTK Query api slice, base query, utils
  main.tsx
```

**Rule of thumb:** page/component code and RTK Query endpoints specific to one domain go in that feature's folder under `features/`, injected into the single shared `api` slice from `lib/api.ts` via `injectEndpoints()`. Anything cross-cutting (the base query, generic utils) goes in `lib/`. Global client-side state that isn't server data goes in a Redux slice under the relevant feature (or `app/store.ts` if truly app-wide).
