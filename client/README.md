# Kanbot Client

**Your sprint board with an AI teammate.**
Kanbot is a single-user sprint board: plan a backlog, run sprints on a four-column board and let an AI assistant generate todos, plan sprints and write summaries. This is its React frontend. It talks to the provided Express API in `../server` and does not change it.

**Live demo:** https://kanbot-five.vercel.app  
**API (backend):** https://kanbot-m7cu.onrender.com

## What it does

- **Accounts:** register, log in, stay signed in across reloads, and sign out. An expired session is handled cleanly.
- **Projects:** create, edit, delete and switch projects; every project has a short key for its todos (for example `KAN-12`).
- **Backlog:** quick create, search and filters, a details dialog, planned sprints, and moving todos between the backlog and sprints.
- **Sprints:** start a sprint, work on a four-column board with drag and drop, complete it, and review the history with statistics.
- **AI assistant:** a chat drawer, generate todos, plan a sprint, summarize a sprint, improve or estimate a todo, and a daily stand-up.
- **Responsive and accessible:** works on phones, tablets and desktops, with full keyboard support and a light and a dark theme.

## Run it locally

**Prerequisites:** Node.js 20 or later and the Kanbot server running on `http://localhost:4000`.

**1. Start the server** (separate terminal):

```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
npm run seed              # creates the demo user and sample data (this RESETS the database)
npm run dev
```

**2. Start the client:**

```bash
cd client
npm install
cp .env.example .env      # on Windows: copy .env.example .env
npm run dev
```

`client/.env` contains one line:

```
VITE_API_URL=http://localhost:4000/api
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Demo account:** `demo@kanbot.dev` / `password123` (available after `npm run seed`).

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Tech stack

| Area | Choice |
|---|---|
| Framework | React 19, TypeScript (strict), Vite |
| UI | shadcn/ui (Base UI primitives) with Tailwind CSS v4, lucide-react icons |
| Routing | react-router |
| Server state | TanStack Query |
| Client state | Zustand (session, theme and sidebar) |
| Forms | react-hook-form with zod |
| HTTP | Axios |
| Drag and drop | dnd-kit |
| Markdown (AI replies) | react-markdown |
| Dates | date-fns |
| Toasts | Sonner |
| Fonts | Inter (body) and Bricolage Grotesque (headings) |
| Tests | Vitest |

## Project structure

```
src/
├── api/          # one file per API area (client.ts, auth.ts, projects.ts, todos.ts, sprints.ts, ai.ts)
├── store/        # Zustand stores (auth, theme, sidebar, AI drawer)
├── hooks/        # TanStack Query hooks shared by several features
├── components/   # generic UI only (ui/ from shadcn, layout/, EmptyState, ErrorState, ConfirmDialog, ...)
├── features/     # one folder per domain: auth, projects, backlog, board, sprints, todos, ai, shortcuts
│   └── <feature>/{pages,components,hooks}
├── lib/          # pure helpers (formatting, board logic, estimates, velocity) and their tests
├── types/api.ts  # the API contract, copied unchanged from the server
├── router.tsx
└── main.tsx
```

Rule of thumb: if a component could be dropped into another project unchanged, it lives in `components/`.
If it knows what a todo, sprint or project is, it lives in `features/`.

## Design decisions and why

### UI library
shadcn/ui copies its components into the project, so they can be restyled freely, and they come with focus handling and keyboard support, which covers much of the accessibility requirement. Tailwind keeps styling next to the markup, and all colors are CSS variables so the light and dark themes share the same components.

### Look and feel
- **Color:** one action color, Kanbot indigo, taken from the logo. Soft lavender surfaces in light mode and a calm blue-gray in dark mode (not pure black, to be easy on the eyes).
- **Typography:** Inter for everything you read and click; Bricolage Grotesque for headings only (logo, page titles, sprint and group names). Ticket keys use tabular numbers so `KAN-2` and `KAN-10` line up.
- **Surfaces:** fields sit on the surface color so they lift off the page; outline buttons have their own surface and a clearer border; group headers (sprint and backlog) use a slate tint that differs from the page and the rows.
- **Status is never color alone:** priority, type and due dates always carry an icon and a label.
- **Due dates:** color is spent only where attention is needed. Overdue is rose (so it never reads as "urgent"), due today is amber, a far date stays neutral.
- **AI actions:** every AI button has an indigo tint and a sparkle icon, so AI features are recognizable; the main action of a screen is the only solid indigo button. Nothing pulses while a request runs.
- **Inputs:** on focus the border leans toward the primary color and a soft halo fades out around the field, instead of a hard outline. Invalid fields get the same effect in red.
- **Contrast:** secondary text is about 7.6:1 in light mode, and field and outline-button edges are about 3:1 in both themes.
- **Dark mode:** a toggle in the sidebar and on the auth pages. The choice is saved in `localStorage` and the first visit follows the system setting. An inline script in `index.html` applies it before the first paint, so there is no flash.
- **Browser details:** Edge's built-in "reveal password" icon is hidden because the app has its own Show / Hide button.

The full visual reference is in [`docs/design-system.html`](docs/design-system.html).

### Responsive design
The app is usable on phones, tablets and desktops.
- From 1024 px there is a persistent sidebar that can collapse to an icon rail. Below 1024 px a top bar with a menu button opens the same navigation in a side sheet.
- Toolbars and headers wrap, long titles are truncated, and the projects grid uses one, two or three columns.
- The board keeps fixed-width columns that scroll horizontally on narrow screens.
- Dialogs fit the viewport: the body scrolls inside the dialog, the action buttons stay visible, and a soft shadow shows when more content is hidden below.
- Pages use `100dvh`, so mobile browser toolbars do not cut the layout.
- Every drag action has a non-drag alternative (a card menu, "Move to top / bottom", the sprint field in the details dialog), so everything can be done by touch without dragging.

### Accessibility
- Everything is reachable by keyboard with a visible focus indicator; dialogs trap focus, close with Esc and return focus to the control that opened them.
- Icon-only buttons have accessible labels, fields have linked labels, and errors use `role="alert"`.
- Motion (the focus halo, sidebar width) is switched off for users who prefer reduced motion.

### State management
- **Server data lives in TanStack Query only.** It is never copied into component state (the one exception is a temporary copy of the board columns while a card is being dragged).
- **Zustand** holds the session. Only the **JWT** is persisted (NFR-7); the user is fetched from `/auth/me` on startup, with a loading screen. Small UI preferences (theme, sidebar collapsed) are stored separately.
- After any todo or sprint mutation, the todo, sprint and project queries are invalidated, because counters and statistics change in all three.

### Data loading
The backlog uses two parallel queries instead of a request chain: one for every todo of the project (feeds the planned-sprint sections and the "move to" targets) and one for the backlog with the search and filters applied. Search is debounced (300 ms).

### API layer
- `api/client.ts` wraps Axios. Every non-2xx answer becomes an `ApiError` with `status`, `code`, `message` and field `details`, and network failures become a `NETWORK_ERROR`. Axios is configured so it never throws for HTTP status codes, which keeps all status handling in one place.
- Server validation errors (`details[]`) are shown **under the matching field**; a `409` on a project key appears under the key field.
- **Any `401` except on login** clears the session and shows "Your session has expired. Please log in again." A server that is simply unreachable does **not** log the user out: the app shows an error screen with Try again and Log out.

### Auth and routing
- `ProtectedRoute` sends signed-out users to `/login?redirect=...`; `GuestRoute` sends signed-in users to `/projects`.
- The `redirect` parameter is only honoured for in-app paths (`/...`), never external URLs.
- Every `/projects/:projectId/*` page sits behind one route that loads the project first, so an unknown id shows "Project not found" instead of an empty page.

### Drag and drop and optimistic updates
Moving a todo (between board columns, inside a column, or reordering the backlog) updates the screen immediately and sends the request in the background. If the request fails, the change is rolled back and a toast explains it. Moves run one at a time, and the data is refetched after the last one, so a failed move cannot erase a later one. Dragging is disabled in the backlog while a search or filter is active, because reordering a filtered list would be ambiguous. Board cards are moved with the pointer or with their menu; there is deliberately no keyboard dragging on cards, because a card holds two interactive elements.

### Loading, empty and error states
Every data view has all three. While a request has failed, the error state is shown **instead of** stale cached data.

## Requirements status

| Area | Requirement | Status |
|---|---|---|
| Auth | AUTH-1 … AUTH-6 (register, login, persistence, logout, guards, expired session) | ✅ |
| Projects | PRJ-1 … PRJ-5 | ✅ |
| Backlog | BL-1 … BL-7 (list, quick create, details, delete, reorder, search and filters, moving) | ✅ |
| Sprints | SPR-1 … SPR-7 (planned sprints, start, board, drag and drop, complete, history) | ✅ |
| AI | AI-1 … AI-5 (chat, generate todos, plan sprint, summary, states and Mock AI badge) | ✅ |
| Quality | NFR-1 … NFR-9 (see [`docs/QA-REPORT.md`](docs/QA-REPORT.md)) | ✅ |

## Extras

Everything below goes beyond the required list.

**Interface**
- **Dark mode** with a remembered choice and no flash on load.
- **Collapsible sidebar:** the desktop sidebar collapses to an icon rail with tooltips and an accessible label on every item. The choice is remembered in `localStorage`.
- **Undo after moving a todo:** a toast offers Undo, which moves it back to its previous status, sprint and position. Undo exists for moves only: deleting cannot be undone cleanly, because re-creating a todo would give it a new key, and keys never change.
- **Due-date indicators:** "Overdue · Nov 3", "Due today" or "Due Nov 20", each with an icon and text, hidden once a todo is done.
- **Responsive on every screen size**, including phones (see Responsive design above).

**AI**
- **Suggested questions per page:** the drawer offers starter questions that depend on the screen you are on.
- **Chat history per project:** kept in `localStorage` because the chat API is stateless (a client-side simulation), and cleared when the user logs out.
- **Improve with AI:** a button in the todo details dialog; the result is a suggestion to review, and nothing is saved until Save is pressed.

**Final-day extras (X1 to X6)**

| # | Extra | What it does |
|---|---|---|
| X1 | **Error boundary** | A friendly "Something went wrong" screen with Reload and Back to projects instead of a blank page. It combines the router's `errorElement` with a class boundary for everything outside the router. |
| X2 | **Estimate with AI** | Suggests a story-point value (1, 2, 3, 5, 8 or 13) with a reason. Apply fills the field only; nothing is saved until Save. Unreadable answers are rejected, never guessed. |
| X3 | **Unit tests** | Vitest tests for the pure logic: moving cards, board totals and reading an estimate. Run with `npm test`. |
| X4 | **Keyboard shortcuts** | `c` focuses quick create, `/` focuses search, `?` lists the shortcuts. They are ignored while typing and when a dialog is open. |
| X5 | **Velocity chart** | Points done per completed sprint with an average line, built without a chart library and described for screen readers. |
| X6 | **Daily stand-up assistant** | A quick action in the AI drawer that summarizes the active sprint's board as a stand-up update. Quick actions follow the page: backlog actions on the backlog, sprint actions on the board and sprints pages. |

## Testing

- **Unit tests:** `npm test` covers the pure board and estimate logic.
- **Manual QA:** the full acceptance checklist was run on a clean account, and every defect found is recorded with its cause and fix in [`docs/QA-REPORT.md`](docs/QA-REPORT.md).
- **Static checks:** `npm run lint` and `npm run build` pass without errors.

## Deployment

The client is deployed on Vercel at https://kanbot-five.vercel.app. `vercel.json` rewrites every path to `index.html`, so reloads and direct links work, and `VITE_API_URL` is set in the Vercel project settings (the site is rebuilt after changing it).

The API (the provided `server/`, unchanged) runs on Render at https://kanbot-m7cu.onrender.com, so `VITE_API_URL` on Vercel is `https://kanbot-m7cu.onrender.com/api`. On the free plan the service sleeps after inactivity, so the first request can take about a minute, and stored data may be reset. The recorded demo and the local setup above are the reference.

## Known issues

- `npm run seed` resets the whole database, including accounts created by hand.
- On a free API host the first request after inactivity is slow, and stored data may be reset.
- Without an API key the server answers AI requests with its built-in simulator; the **Mock AI** badge is shown whenever that is the case, and the answers are rule-based rather than from a real model.
- Board cards have no keyboard dragging by design; use the card menu to move them.

## Documentation

Day-by-day feature references (what was built, how it works, how it was verified) are in [`docs/`](docs/):

- [Day 1: Foundation and authentication](docs/DAY-1-LOG.md)
- [Day 2: Application shell and projects](docs/DAY-2-LOG.md)
- [Day 3: Backlog, todo details and planned sprints](docs/DAY-3-LOG.md)
- [Day 4: Board, drag and drop, completing sprints and history](docs/DAY-4-LOG.md)
- [Day 5: The AI assistant](docs/DAY-5-LOG.md)
- [Day 6: Quality, polish, extras and delivery](docs/DAY-6-LOG.md)
- [QA report](docs/QA-REPORT.md)
- [Design system reference](docs/design-system.html)

## Demo

Open the live site above and use the demo account. A recorded walkthrough covers the full flow: register, create a project, generate todos with AI, plan a sprint with AI, start the sprint, move cards, complete the sprint and read the AI summary.
