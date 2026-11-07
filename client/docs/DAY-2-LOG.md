# Day 2: Application Shell and Projects (Feature Reference)

**Scope:** the authenticated application frame, the project data layer, shared state components, dark mode and the complete Projects area.
**Requirements covered:** PRJ-1 … PRJ-5, plus NFR-2 (loading, empty and error states), NFR-3 (feedback and confirmations) and NFR-4 (responsive shell).
**Status:** complete and verified manually.

This document describes, feature by feature, exactly what was implemented, where it lives and how to verify it.

## At a glance

| Feature | Requirement | Main files |
|---|---|---|
| 1. Projects data layer | PRJ-1 … PRJ-5 | `src/api/projects.ts`, `src/hooks/useProjects.ts` |
| 2. Shared state components | NFR-2, NFR-3 | `EmptyState.tsx`, `ErrorState.tsx`, `ConfirmDialog.tsx` |
| 3. Dark mode | extra | `src/store/theme.store.ts`, `ThemeToggle.tsx` |
| 4. Application shell (collapsible sidebar) | NFR-4 | `components/layout/AppShell.tsx`, `Sidebar.tsx`, `PageHeader.tsx`, `store/sidebar.store.ts` |
| 5. Project switcher | PRJ-5 | `components/layout/ProjectSwitcher.tsx` |
| 6. Routing and project guard | PRJ-5 | `src/router.tsx`, `ProjectRoute.tsx` |
| 7. Projects list | PRJ-1 | `ProjectsPage.tsx`, `ProjectCard.tsx` |
| 8. Create project | PRJ-2 | `ProjectDialog.tsx`, `project-form/` |
| 9. Edit project | PRJ-3 | same dialog and form, in edit mode |
| 10. Delete project | PRJ-4 | `ConfirmDialog.tsx`, `useDeleteProject` |

---

## 1. Projects data layer

**What was implemented**
- `api/projects.ts` exposes `list`, `get`, `create`, `update` and `remove`. It unwraps the API envelopes (`{ projects }`, `{ project }`), so components receive plain data (`ProjectWithStats[]`, `ProjectWithStats`, `Project`).
- `hooks/useProjects.ts` exposes `useProjects`, `useProject(id)`, `useCreateProject`, `useUpdateProject` and `useDeleteProject`.
- **Query keys:** `["projects"]` for the list and `["projects", id]` for a detail. Because the detail key starts with the list key, invalidating the list refreshes both.
- Every successful mutation invalidates `["projects"]` and shows a toast ("Project created", "Project updated", "Project deleted").
- Create and update leave field errors to the form. Delete has no fields, so its failure is shown as a toast.
- `useProject` is disabled until an id exists (`enabled`).

**How to verify:** create, rename and delete a project: the list updates without a manual refresh and a toast appears each time.

## 2. Shared state components

- **`EmptyState`:** dashed container with an icon (default or custom), title, optional description and optional action slot.
- **`ErrorState`:** `role="alert"` container with an icon, a title (default "We couldn't load this"), a message, an optional **Try again** button and an optional extra-content slot (used for links such as "Back to all projects").
- **`ConfirmDialog`:** built on `Dialog`. Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `loading`, `onConfirm`. While `loading` is true, the dialog cannot be closed (Esc, backdrop and Cancel are blocked) and the confirm button shows "Deleting…". The confirm button uses the destructive style.

These three are generic: they know nothing about projects and are reused on every later page.

## 3. Dark mode

**What was implemented**
- `theme.store.ts` (Zustand): reads the saved choice from `localStorage` (`kanbot-theme`), falls back to the system preference on the first visit, and applies it by toggling the `dark` class and `color-scheme` on `<html>`. The module runs once, before React renders (imported in `main.tsx`).
- `toggle()` flips the theme, applies it, saves it and updates the store.
- `ThemeToggle`: a 32 px icon button (moon in light mode, sun in dark mode) with `aria-label` and `title` describing the action ("Switch to dark mode" / "Switch to light mode").
- It lives in the sidebar footer (visible when the sidebar is expanded) and in the corner of the Login and Register pages.

**How to verify:** toggle the theme, reload: the choice is kept. Clear storage: the system preference is used.

## 4. Application shell

**What was implemented**
- **`AppShell`:** a sticky sidebar from the `lg` breakpoint (1024 px) that can be **collapsed to an icon rail** (4.5 rem wide) or expanded (16 rem), with a width transition that respects reduced motion. Below 1024 px a top bar with a menu button ("Open menu") opens the full sidebar inside a `Sheet` from the left; the sheet closes on navigation and has a screen-reader-only title. The shell also hosts the AI drawer (`AiHost`, Day 5).
- **Collapse state:** `sidebar.store.ts` (Zustand with `persist`, key `kanbot-sidebar`) remembers whether the desktop sidebar is collapsed or expanded. It is a UI preference, not user data.
- **`Sidebar`:**
  - Header: the logo (with the wordmark, in the display font, when expanded) and a collapse / expand button (`aria-expanded`, label "Collapse sidebar" / "Expand sidebar").
  - A `nav` landmark labelled "Main". The project section (switcher, "Project" label, **Backlog**, **Active Sprint**, **Sprints**) appears only when the URL contains a project id (`useMatch("/projects/:projectId/*")`). **Projects** is always shown, below a divider. The active link is highlighted (`NavLink`); the Sprints link stays highlighted on nested routes (`end={false}`).
  - **Collapsed:** each item shows only its icon, with the name available as a tooltip and as an `aria-label`.
  - **Footer, expanded:** the user's avatar with initials, name and email, and two icon buttons: the theme toggle and **Log out**. **Footer, collapsed:** only the avatar, with the name and email in a tooltip. The theme and Log out buttons are not rendered at all while collapsed, so they cannot be reached by keyboard while hidden.
- **`PageHeader`:** shared page top bar with a title in the display font, optional meta text (for example "5 projects") and an actions slot.

**How to verify:** collapse the sidebar and reload (the state is kept); resize below 1024 px (the menu button and sheet appear, always with the full sidebar); press Esc to close the sheet.

## 5. Project switcher (PRJ-5)

- A dropdown at the top of the project section. Expanded, the trigger shows `KEY · Project name` (or "Select project" while loading or if the id is unknown) and has `aria-label="Switch project"`. **Collapsed**, it shrinks to a square showing the project key (for example `KAN`), with the full name as a tooltip, and the menu opens to the side.
- The menu lists every project with a check mark on the current one; choosing one navigates to `/projects/<id>/backlog`. "All projects" returns to `/projects`. An empty list shows "No projects yet".
- The project id lives in the URL, so reload and deep links keep the selected project.

## 6. Routing and project guard

**What was implemented**
- All application pages sit under `ProtectedRoute` → `AppShell`.
- Routes: `/projects`; `/projects/:projectId` (redirects to `backlog`); `backlog`, `board` and `sprints` under it. The Backlog, Board and Sprints pages started as placeholders on this day and were built on the following days.
- **`ProjectRoute`** wraps every `/projects/:projectId/*` page. It loads the project once:
  - loading → centered spinner;
  - 404 → "Project not found. This project doesn't exist, or you don't have access to it." with a "Back to all projects" link;
  - any other error → the error message with Try again;
  - success → renders the page (`Outlet`).
- Pages therefore never validate the project id themselves.

**How to verify:** open `/projects/abc123/backlog`: "Project not found" appears instead of the page.

## 7. Projects list (PRJ-1)

**Behavior**
- Header: "Projects", a count ("1 project" / "N projects") and a **New project** button.
- **Loading:** six skeleton cards (`aria-busy`). **Empty:** "No projects yet — Create your first project to start planning sprints" with a New project action. **Error:** the error state alone; the cached list is hidden while the last request has failed, so stale data is never shown beside an error.
- **Search:** a local filter over the loaded list (name, key and description, case-insensitive). When nothing matches, a different message ("No projects match …") is shown.
- Responsive grid: 1, 2 or 3 columns. The last tile is a dashed "New project" button.
- **`ProjectCard`:** initial avatar, name, key badge, description (two lines, or "No description"), a divider and a stats line: `N backlog · Sprint X active` or `N backlog · No active sprint`. The title is a real link stretched over the whole card, so the card is clickable and still accessible; the actions menu (`aria-label="Actions for <name>"`) sits above it with **Edit** and **Delete**.

**How to verify:** see the verification table.

## 8. Create project (PRJ-2)

**Behavior**
- Opened from the header button, the dashed tile or the empty state. Fields: **Name** (focused on open), **Key**, **Description**.
- **Validation (zod):** name 1–80 characters; key empty or 2–6 letters A–Z; description up to 500 characters.
- The key input is limited to six characters and is **uppercased while typing**. Placeholder "Auto-generated" with the hint "2–6 letters, used in todo keys like KAN-12. Leave empty to generate it from the name."
- The request sends `key` only when it is not empty; the server generates it otherwise.
- **Server errors:** a `409` (key already used) is shown **under the Key field** and the dialog stays open; validation `details[]` are mapped to their fields; any other error appears in a `role="alert"` banner.
- Buttons: Cancel and "Create project" (reads "Saving…" and is disabled while pending).
- **On success:** the dialog closes, a toast appears and the app navigates to `/projects/<id>/backlog`.

## 9. Edit project (PRJ-3)

- The same dialog and form in edit mode (opened from the card menu): title "Edit project", fields pre-filled, button "Save changes".
- The key hint changes to "Changing the key does not change the keys of existing todos (KAN-12 stays KAN-12)."
- Sends `PATCH /projects/:id`; the list refreshes and a toast confirms.
- The form is remounted per project (`key={project.id}`), so values never leak between projects.

## 10. Delete project (PRJ-4)

- Opened from the card menu. `ConfirmDialog` reads: "This will permanently delete “<name>” and all of its todos and sprints. This cannot be undone." Confirm button "Delete project".
- While the request runs the dialog is locked and shows "Deleting…". On success it closes, the project disappears from the list and a toast appears; on failure a toast shows the server message.

---

## Verification

| Test | Expected | Result |
|---|---|---|
| Open `/projects` with projects | Cards with backlog counts and sprint status | Pass |
| Delete every project | Empty state with a New project button | Pass |
| Stop the server, reload `/projects` | Only the error state, no cards; Try again recovers | Pass |
| Create a project without a key | Key generated, lands on `/projects/<id>/backlog` | Pass |
| Create a project with an existing key | Error under the Key field, dialog stays open | Pass |
| Key `A` or `ab1` | "Use 2–6 letters (A–Z)." | Pass |
| Edit name and description | Updated in the list, toast shown | Pass |
| Delete a project | Confirmation names the project; project disappears | Pass |
| Search by part of a name or key | List filters instantly; "No projects match" when empty | Pass |
| Switcher | Changes the URL and the page; reload keeps the project | Pass |
| `/projects/abc123/backlog` | "Project not found" with a link back | Pass |
| Window narrower than 1024 px | Menu button opens the sidebar as a sheet | Pass |
| Collapse the sidebar, then reload | Icon rail is kept; the footer shows only the avatar | Pass |
| Theme toggle, then reload | Choice is kept | Pass |
| Keyboard: Tab, Enter, Esc | Menus and dialogs usable; Esc closes; focus stays inside dialogs | Pass |

## Issues found and fixed

| Issue | Cause | Fix |
|---|---|---|
| Dark mode did nothing | The dark colors existed, but nothing added the `dark` class | Added `theme.store.ts` and `ThemeToggle` |
| Stale project list shown next to the error when the server stopped | TanStack Query keeps the last successful data after a failed refetch | `const projects = isError ? undefined : data`: the error state is shown alone |
| A page rendered normally for an unknown project id | Nothing checked that the project exists | Added the `ProjectRoute` guard |
| Signed out whenever the server was down | The session bootstrap cleared the session on any failure | Only a 401 ends the session; other failures show Try again and Log out |
| A hand-made account disappeared after restarting the server | `npm run seed` resets the whole database | Documented in the README; use `npm run dev` day to day |
