# Day 6: Quality, Polish, Extras and Delivery (Feature Reference)

**Scope:** the full quality pass (QA and non-functional review), the design and responsive polish, the six planned extras (X1 to X6), deployment and documentation.
**Requirements covered:** NFR-1 … NFR-9 (review and fixes), plus extras.
**Status:** complete.

This document describes, feature by feature, what was done on the last day, where it lives and how to verify it. No new core features were added: anything missing from earlier days was treated as a defect and fixed.

## At a glance

| Feature | Area | Main files |
|---|---|---|
| 1. Quality pass and non-functional review | NFR-1 … NFR-9 | `docs/QA-REPORT.md` |
| 2. Design system polish | UI/UX | `src/index.css`, `docs/design-system.html` |
| 3. Responsive layout and accessibility | NFR-4, NFR-5 | layout components, dialogs, `ScrollShadow` |
| 4. X1 Error boundary | extra | `RouteErrorPage.tsx`, `ErrorBoundary.tsx`, `router.tsx`, `main.tsx` |
| 5. X2 Estimate with AI | extra | `lib/parseEstimate.ts`, `useEstimateTodo.ts`, todo details form |
| 6. X3 Unit tests | extra | `lib/board.test.ts`, `lib/parseEstimate.test.ts` |
| 7. X4 Keyboard shortcuts | extra | `hooks/useHotkeys.ts`, `ShortcutsDialog.tsx` |
| 8. X5 Velocity chart | extra | `lib/velocity.ts`, `VelocityChart.tsx` |
| 9. X6 Daily stand-up assistant | extra | AI drawer quick action |
| 10. Deployment | delivery | `vercel.json`, Vercel project settings |
| 11. Documentation | delivery | `README.md`, `docs/` |

---

## 1. Quality pass and non-functional review

**What was done**
- The full acceptance checklist was run on a clean account (authentication, projects, backlog, sprints, board, AI) and every failure was recorded with its cause and fix in `docs/QA-REPORT.md`.
- **NFR-2 (states):** every data view was checked for its loading, empty and error state with the server stopped. The rule everywhere is: when the last request failed, show the error state alone, never stale data beside it.
- **NFR-3 (feedback):** every mutation gives a toast or an inline message, and every destructive action asks for confirmation (delete project, todo and sprint, complete sprint, discard changes).
- **NFR-1 (quality):** `npm run lint` and `npm run build` pass; `any` is not used without a comment; no unexplained `@ts-ignore`.
- **NFR-6 (performance):** the todo queries start in parallel, search is debounced, and moves are optimistic.
- **NFR-7 (security):** only the JWT is persisted for the session; nothing logs it; AI Markdown is rendered without raw HTML.
- **NFR-8 (structure):** all HTTP calls live in `src/api/`; commits are small and descriptive.
- **NFR-9 (language):** all interface text is in English and dates are human readable (`Oct 20 – Nov 2`).

## 2. Design system polish

**What was implemented** (all in `src/index.css`, with a visual reference in `docs/design-system.html`)
- **Typography:** Inter for everything you read and click; **Bricolage Grotesque** (700 and 800) for headings only: the logo wordmark, page titles, sprint and group names (`--font-display`). Ticket keys use tabular numbers (`.ticket-key`) so `KAN-2` and `KAN-10` line up.
- **Surfaces:** fields (search, selects, inputs, textareas) sit on `--field` (white in light, the card surface in dark) so they lift off the page; outline buttons have their own `--control` surface; group headers (sprint and backlog) use `--list-head`, a cool slate tint that differs from the page and the rows.
- **Priority badges:** Urgent, High, Medium and Low each have a background, text and border token in both themes, plus an icon and a label.
- **Due dates:** overdue is rose (so it never reads as "urgent"), due today is amber, and a far date stays neutral; each state has its own icon.
- **AI actions:** an indigo tint (`.ai-btn`) and a sparkle icon on every AI button, with one solid indigo button per screen for the main action. Nothing pulses while a request runs: the button is disabled and the panel shows its own loading state. The assistant drawer's quick actions are plain pill buttons without an icon.
- **Interactive rows:** rows and cards keep their color on hover; the focus ring on the title is the only hover/focus cue, so keyboard users are never left without one.
- **Scroll shadow:** `ScrollShadow` draws the shadow above the content and only while more content is hidden below, so it never shows on tall screens and never sits behind a suggestion box.
- **Board:** light mode tints each lane by status; dark mode uses one neutral surface and a 3 px top line in the status color that follows the lane's rounded corners.
- **Contrast:** secondary text is about 7.6:1 in light mode; field edges and outline borders are about 3:1 in both themes; destructive has separate fill, text and subtle-background tokens.

**How to verify:** open `docs/design-system.html` next to the app and compare the toolbar, group headers, due-date badges and board in both themes.

## 3. Responsive layout and accessibility

**Responsive behavior (phones, tablets and desktops)**
- From 1024 px a persistent sidebar that can collapse to an icon rail. Below 1024 px a top bar with a menu button opens the same navigation in a side sheet.
- Toolbars and headers wrap instead of overflowing; long titles are truncated; the projects grid uses one, two or three columns.
- The board keeps fixed-width columns that scroll horizontally on narrow screens.
- Dialogs fit the viewport: the body scrolls inside the dialog, the footer with the action buttons stays visible, and a soft shadow shows when there is more content below. Forms are a single column on small screens.
- Pages use `100dvh`, so mobile browser toolbars do not cut the layout.
- **Every drag action has a non-drag alternative** (card menu, "Move to top / bottom", the sprint field in the details dialog), so everything can be done by touch without dragging.

**Accessibility**
- Everything is reachable by keyboard with a visible focus indicator; dialogs trap focus, close with Esc and return focus to the control that opened them.
- Icon-only buttons have an accessible label; fields have linked labels and `aria-invalid` / `aria-describedby`; errors use `role="alert"`.
- Status, priority, type and due dates always use an icon or text, never color alone.
- Motion (focus halo, sidebar width) is switched off when the user prefers reduced motion.

## 4. X1: Error boundary

- The app uses `createBrowserRouter`, which catches page render errors itself, so a **`RouteErrorPage`** is set as the `errorElement` of the root route; a class component **`ErrorBoundary`** wraps what sits outside the router.
- The screen says "Something went wrong" with **Reload** and **Back to projects** buttons. The error details are logged to the console only, never shown in the interface.

## 5. X2: Estimate with AI

- An **Estimate** button next to the story points in the todo details dialog sends the todo (title, description, type) and asks the assistant for **one** value from 1, 2, 3, 5, 8, 13 with a one-line reason.
- The answer appears as a suggestion ("Suggested: 5 pts · reason") with **Apply** and **Dismiss**. **Apply only fills the field**; nothing is saved until Save.
- `parseEstimate` (a pure function) extracts the first valid value and returns `null` otherwise, in which case the message "Couldn't read an estimate. Try again." is shown. AI output is never trusted blindly.
- Loading, error and Mock AI states are handled like the other AI actions.

## 6. X3: Unit tests

- Vitest (`npm test`) covers the **pure logic** only: `moveInColumns` (inside a column, across columns, into an empty column, out-of-range index, inputs not mutated), `boardTotals` (empty columns, unestimated todos) and `parseEstimate` (valid answer, no number, a number outside the allowed set, a number inside a sentence).
- Modules that touch `localStorage` or React are intentionally not imported in tests.

## 7. X4: Keyboard shortcuts

- **`c`** focuses the quick-create field (Backlog), **`/`** focuses the search box, **`?`** opens a dialog listing the shortcuts.
- Shortcuts are ignored while typing in a field, while a dialog or the drawer is open, and when Ctrl, Alt or Meta is pressed, so they never fight the browser or the user. They are never the only way to do something.

## 8. X5: Velocity chart

- On the Sprints page: one bar per completed sprint showing the points done, built with CSS (no chart library), with the value above each bar and an average line.
- Accessible: the chart has `role="img"` and an `aria-label` that summarises the values; numbers are visible, so color is not the only carrier. With no completed sprint an empty state is shown.
- The data comes from the sprints' `completedStats` through the pure helper `lib/velocity.ts`.

## 9. X6: Daily stand-up assistant

- A **Daily stand-up** quick action in the AI drawer builds a prompt from the active sprint's board (done, in progress, in review) and sends it through the chat endpoint; the reply is rendered as Markdown.
- It is disabled with a visible reason ("No active sprint") when no sprint is active.
- Quick actions follow the page: **Create todos** and **Plan sprint** are enabled on the backlog only; **Summarize sprint** and **Daily stand-up** on the board and sprints pages only (and need an active sprint). A short hint explains why the others are off.

## 10. Deployment

- **Client:** Vercel, at https://kanbot-five.vercel.app. `vercel.json` rewrites every path to `index.html`, so reloads and direct links work. `VITE_API_URL` is set in the Vercel project settings and the site is rebuilt after changing it.
- **Note:** a free API host may sleep after inactivity (the first request can take about a minute) and may reset stored data. The recorded demo and the local setup are the reference.

## 11. Documentation

- `README.md` is complete: run instructions, stack, structure, design decisions, requirements status, extras (X1 to X6 listed), testing, deployment and known issues.
- `docs/DAY-1-LOG.md` … `DAY-6-LOG.md` (these files), `docs/QA-REPORT.md` and `docs/design-system.html`.

---

## Improvements added after the first pass

- [x] Due-date badges (overdue, today, later) use the design-system colors, each with an icon
- [x] Low and Medium priority badges use the design-system slate and sky colors
- [x] AI buttons use the indigo tint with a static sparkle (the pulse was removed)
- [x] Create sprint and AI toolbar buttons use the design-system spacing
- [x] "Edit" on a planned sprint sits on the white field surface (`.btn-surface`)
- [x] Bricolage Grotesque for headings only; Inter for everything else
- [x] Rows keep their color on hover
- [x] Scroll shadow above the content, only when there is more to scroll
- [x] The todo details dialog uses the available height, with Type and Story points side by side
- [x] Drawer quick actions are enabled per page
- [x] Theme tokens merged into one light and one dark set in `index.css`
- [x] Undo after moves, due-date indicators, suggested questions, chat history per project and Improve with AI (Days 4 and 5)
- [x] X1 Error boundary, X2 Estimate, X3 Unit tests, X4 Shortcuts, X5 Velocity, X6 Daily stand-up

## Verification

- [ ] The full acceptance checklist passes on a clean account.
- [ ] `npm run lint`, `npm run build` and `npm test` are clean; the console has no errors on any page.
- [ ] Every data view shows loading, empty and error states; the error state hides stale data.
- [ ] Keyboard only: log in, open a todo, save, close with Esc; focus is always visible.
- [ ] Phone width and 768 px: the sidebar becomes a sheet, the board scrolls horizontally, dialogs scroll with a visible footer.
- [ ] A forced render error shows the error screen (X1).
- [ ] Estimate suggests a value and Apply does not save (X2).
- [ ] `c`, `/` and `?` work and are ignored while typing (X4).
- [ ] The velocity chart shows completed sprints and an empty state otherwise (X5).
- [ ] Stand-up is disabled without an active sprint (X6).
- [ ] The Vercel site opens, a deep link reloads correctly and the theme has no flash.
- [ ] Quick actions in the drawer change with the page (backlog vs board and sprints).
- [ ] No element pulses while an AI request is running.
- [ ] The scroll shadow shows only when the dialog has hidden content.

## Decisions

| Decision | Reason |
|---|---|
| No new core features | The last day is for correctness, polish and delivery |
| Extras only after the quality pass | Extras are not graded on their own; defects are |
| `errorElement` plus a class boundary | `createBrowserRouter` catches page errors, so a class boundary alone would not |
| Velocity chart without a library | One more dependency was not worth a simple bar chart |
| Every drag has a menu alternative | Touch devices and keyboard users can do everything |
| No pulse on AI buttons | Motion for its own sake distracts; the disabled button and the loading state already show that work is running |
