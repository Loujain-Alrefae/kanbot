# Day 1: Foundation and Authentication (Feature Reference)

**Scope:** project foundation, design tokens, API client, session handling, routing and the authentication flow.
**Requirements covered:** AUTH-1 … AUTH-6.
**Status:** complete and verified manually.

This document describes, feature by feature, exactly what was implemented, where it lives and how to verify it.

## At a glance

| Feature | Requirement | Main files |
|---|---|---|
| 1. Project foundation | NFR-1, NFR-8 | `vite.config.ts`, `tsconfig*.json`, `components.json`, `.env` |
| 2. Design tokens and typography | NFR-5 (contrast, focus) | `src/index.css`, `src/main.tsx` |
| 3. API client | NFR-7, AUTH-6 | `src/api/client.ts`, `src/api/auth.ts`, `src/types/api.ts` |
| 4. Session store | AUTH-3, NFR-7 | `src/store/auth.store.ts` |
| 5. Session bootstrap | AUTH-3 | `features/auth/components/AuthBootstrap.tsx` |
| 6. Routing, guards and providers | AUTH-5 | `src/router.tsx`, `src/main.tsx`, `RouteGuards.tsx` |
| 7. Auth UI building blocks | NFR-5 | `AuthLayout.tsx`, `PasswordField.tsx`, `Spinner.tsx` |
| 8. Registration | AUTH-1 | `register-form/`, `useRegister.ts`, `RegisterPage.tsx` |
| 9. Login | AUTH-2 | `login-form/`, `useLogin.ts`, `LoginPage.tsx` |
| 10. Logout | AUTH-4 | `useLogout.ts` |
| 11. Expired session handling | AUTH-6 | `client.ts`, `main.tsx` |
| 12. Page shell | NFR-1 | `index.html`, `vercel.json` |

---

## 1. Project foundation

**What was implemented**
- Vite + React + TypeScript (strict mode) application in `client/`.
- Tailwind CSS v4 through the `@tailwindcss/vite` plugin (`@import "tailwindcss"` in `index.css`).
- shadcn/ui initialised with the Base UI component library; generated components live in `src/components/ui/`.
- Path alias `@` → `src/`, configured in `vite.config.ts` and in `paths` of `tsconfig.json` and `tsconfig.app.json`. (`baseUrl` was removed: TypeScript deprecates it and `paths` is enough.)
- `@types/node` installed for the `path` import in the Vite config.
- Environment: `VITE_API_URL` (default `http://localhost:4000/api`, with the same default in code as a fallback).
- Dependencies: `react-router`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `axios`, `zustand`, `date-fns`, `react-markdown`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@fontsource-variable/inter`, plus `sonner` and `lucide-react` (added by shadcn).
- The API contract was copied unchanged from the server to `src/types/api.ts`.

**How to verify:** `npm run dev` serves the app; `npx tsc -b` reports no errors.

## 2. Design tokens and typography

**What was implemented** (everything lives in `src/index.css`; a visual reference page is kept in `docs/design-system.html`)
- All colors are CSS variables, defined for light (`:root`) and dark (`.dark`) and exposed to Tailwind through `@theme inline`. Components never use fixed colors, so both themes share the same markup.
- **Core tokens, light:** lavender page (`#F4F3FF`), white cards, ink text (`#14123B`). Secondary text is `#4B4A6B` (about 7.6:1) so keys, hints and placeholders are easy to read. Card borders are `#C4C1E4`; field edges use a stronger `#9894C2` (about 3:1).
- **Core tokens, dark:** calm blue-gray page (`#17191F`), cards `#1F222A`, text `#E2E5EC`, secondary text `#9AA1B0`, card borders `#343845`, field edges `#6B7385` (about 3:1). Not pure black, to be comfortable to read.
- **Primary action color:** Kanbot indigo `#4F46E5` (light) / `#5E62E8` (dark), taken from the logo.
- **Destructive** has three tokens: a solid fill for buttons, a text and icon color, and a soft badge background, so red text stays readable in both themes and white text on a red button keeps its contrast.
- **Further token groups**, used by later days: board lanes and status dots, a signal green for the AI antenna, outline-button surface (`--control`), field surface (`--field`), AI tint (`--ai-*`), group header (`--list-head`), priority badges (`--prio-*`), due dates (`--overdue-*`, `--today-*`, `--later-*`) and the scroll shadow.
- **Typography:** Inter (variable) for everything you read and click, registered as `--font-sans`. **Bricolage Grotesque** (700 and 800) for headings only (the logo wordmark, page titles, sprint and group names), registered as `--font-display`.
- **Fields:** `input`, `textarea` and select triggers sit on the surface color (`--field`: white in light mode, the card surface in dark) instead of being transparent, so they lift off the page.
- **Outline buttons** (`variant="outline"` in shadcn) used the page color and vanished into the background. A rule in `index.css` gives them their own surface (`--control`), a hover color and a clearer border in both themes. Two helpers refine them: `.ai-btn` (indigo tint for AI actions) and `.btn-surface` (field surface, for example "Edit" on a sprint).
- **Input focus style:** on focus the border leans toward the primary color (55% mix) and a soft halo fades out around the field (a 3 px ring plus a blurred glow, with a 0.25 s transition). Invalid fields get a full red border with the same halo in red. It is switched off when the user prefers reduced motion, and written once in CSS for every `input` and `textarea`.
- **Browser details:** Edge's "reveal password" icon is hidden (it duplicated the Show / Hide button), and Chrome's autofill tint is neutralised so autofilled fields match the others.
- **Small helpers:** `.ticket-key` (tabular numbers so `KAN-2` and `KAN-10` line up) and `.ai-spark-working` (the AI sparkle pulses while a request runs, off for reduced motion).
- **Scroll shadow:** a soft shadow at the bottom of a scroll area that still has hidden content, as a `ScrollShadow` component driven by `--scroll-shadow` (a dark shadow in light mode, a light one in dark mode).

**How to verify:** open the login page in light and dark mode, click into a field and watch the halo fade in and out; in Edge, check that the password field shows only one Show / Hide control; compare the app with `docs/design-system.html`.

## 3. API client

**What was implemented** (`src/api/client.ts`)
- An Axios instance with `validateStatus: () => true`, so all HTTP status handling happens in one place and Axios never throws for status codes.
- `api.get / post / patch / put / delete` helpers, typed with generics.
- Every request carries `Authorization: Bearer <token>` when a token exists.
- Every non-2xx response is converted to an `ApiError` with `status`, `code`, `message` and `details[]` (`{ path, message }`). Missing or malformed error bodies fall back to `UNKNOWN` and a generic message.
- A network failure becomes `ApiError(0, "NETWORK_ERROR", "Cannot reach the server. Is it running?")`. Cancelled requests are re-thrown untouched.
- `204` responses return `undefined`. Response bodies that are not valid JSON become `null`.
- `fieldErrors(err)` turns `details[]` into `{ fieldName: message }` for the forms.
- `tokenStore` (`get`, `set`, `clear`) reads and writes the token through the Zustand store.
- `setUnauthorizedHandler(fn)` lets the app register what happens after a 401 (see feature 11).
- `src/api/auth.ts` exposes `authApi.login`, `authApi.register`, `authApi.me`.

**How to verify:** stop the server and submit the login form: the banner reads "Cannot reach the server. Is it running?"

## 4. Session store

**What was implemented** (`src/store/auth.store.ts`)
- Zustand store with `token`, `user`, `setSession`, `setUser`, `clearSession`.
- `persist` middleware with key `kanbot-auth` in `localStorage` and `partialize` so that **only the token** is persisted (NFR-7). The user object is fetched again on startup.
- The token is never logged or shown anywhere in the UI.

**How to verify:** in DevTools → Application → Local Storage, `kanbot-auth` contains only the token.

## 5. Session bootstrap

**What was implemented** (`AuthBootstrap.tsx`)
- When a token exists but the user is not loaded, it fetches `/auth/me` once with TanStack Query (`retry: false`) and stores the user.
- While loading, the whole page shows a spinner (`role="status"`).
- A 401 is handled by the API client (session cleared, route guard redirects), so it never reaches this component.
- Any other failure (server down, 5xx) **keeps the session** and shows an error screen with **Try again** and **Log out**.

**How to verify:** sign in, stop the server, reload: the error screen appears and the session is kept; start the server and press Try again.

## 6. Routing, guards and providers

**What was implemented**
- `router.tsx` (`createBrowserRouter`): `/login` and `/register` inside `GuestRoute`; application pages inside `ProtectedRoute`; `/` redirects to `/projects`; a catch-all "Page not found".
- `ProtectedRoute`: without a token, redirects to `/login?redirect=<current path and query>` (URL-encoded).
- `GuestRoute`: with a token, redirects to the `redirect` parameter if it is a safe in-app path (starts with `/`, not `//`), otherwise to `/projects`. External URLs are ignored (no open redirect).
- `main.tsx` wires `QueryClientProvider` (`retry: 1`, no refetch on window focus), `AuthBootstrap`, `RouterProvider` and the Sonner `Toaster`.

**How to verify:** see AUTH-5 in the test table.

## 7. Auth UI building blocks

- **`AuthLayout`:** full-height centered `<main>` (`min-h-dvh`), a card with the logo and wordmark, title, subtitle, content slot and footer link slot, and the theme toggle in the top-right corner (an outline button with the same surface and border as every other outline button, so it reads as a control). The wordmark and the page title use the display font.
- **`PasswordField`:** wraps the input with a Show/Hide button (`aria-pressed`, label "Show password" / "Hide password").
- **`Spinner`:** circular loader with `role="status"` and `aria-label="Loading"`.
- Logo: `src/assets/kanbot-icon.svg`.
- **Form spacing:** every field is a `grid gap-2` block (label, input, message), with `space-y-5` between fields. A `<label>` is an inline element, so vertical margins would not apply to it; the grid gap works regardless.

## 8. Registration (AUTH-1)

**Behavior**
- Fields: Name, Email, Password, Confirm password. Labels are linked to inputs; each field has the right `autocomplete` value.
- Zod rules: name required; email required and valid; password at least 8 characters; confirmation required and equal to the password (error shown on the confirmation field).
- Client errors appear **under the field**, with `aria-invalid` and `aria-describedby`. A helper text "Min 8 characters." is replaced by the error when invalid.
- Only `name`, `email` and `password` are sent to the API.
- Server errors that carry a field path (validation, duplicate email) are placed under that field; any other error appears in a `role="alert"` banner above the form.
- The submit button is disabled and reads "Creating account…" while pending.
- On success the session is stored and the user lands on `/projects` (or the `redirect` target).

**Files:** `register-form/config.ts` (schema), `register-form/index.tsx`, `hooks/useRegister.ts`, `pages/RegisterPage.tsx`.

## 9. Login (AUTH-2)

**Behavior**
- Fields: Email, Password (with Show/Hide).
- Zod rules: both required, email valid.
- Wrong credentials (401) show the server message "Incorrect email or password." in the banner above the form, not under a field.
- Button disabled and labelled "Logging in…" while pending.
- On success the session is stored and the user goes to the `redirect` target or `/projects`.
- Link "No account? Create one".

**Files:** `login-form/config.ts`, `login-form/index.tsx`, `hooks/useLogin.ts`, `pages/LoginPage.tsx`.

## 10. Logout (AUTH-4)

`useLogout` clears the session (token and user) and empties the whole TanStack Query cache, so no data from the previous user can appear. `ProtectedRoute` then sends the user to `/login`; the URL carries the page they left in `redirect`.

## 11. Expired session handling (AUTH-6)

- A 401 on any path **except** `/auth/login` clears the session inside the API client.
- The handler registered in `main.tsx` empties the query cache and shows the toast "Your session has expired. Please log in again." with a fixed `id`, so parallel requests that fail together produce one toast.
- `/auth/login` is excluded because a 401 there means wrong credentials, not an expired session.

## 12. Page shell (`index.html`)

- An inline script applies the saved theme (or the system preference) to `<html>` **before the first paint**, and a small style sets the root background for each theme, so the page never flashes the wrong color while the CSS loads.
- The page title is "Kanbot" and the favicon is the Kanbot icon (`public/kanbot-icon.svg`), instead of the Vite defaults.
- `vercel.json` rewrites every path to `index.html`, so direct links and reloads work on Vercel.

---

## Verification

| Test | Expected | Result |
|---|---|---|
| Register with a new email | Lands on `/projects` | Pass |
| Register with an existing email | Error under the email field | Pass |
| Empty or invalid register form | Errors under each field | Pass |
| Login with the demo account | Lands on `/projects` | Pass |
| Login with a wrong password | Banner "Incorrect email or password." | Pass |
| Reload while signed in | Stays signed in after a short spinner | Pass |
| Logout | Back to `/login` | Pass |
| Open `/projects` while signed out | `/login?redirect=%2Fprojects`, then back to `/projects` after login | Pass |
| Open `/login` while signed in | Redirected to `/projects` | Pass |
| `?redirect=//evil.com` while signed in | Goes to `/projects`, never off-site | Pass |
| Corrupt the stored token and reload | One "session expired" toast, back to `/login` | Pass |

## Issues found and fixed

| Issue | Cause | Fix |
|---|---|---|
| `variant` not accepted by `Button` | The editor auto-imported `Button` from `@base-ui/react` | Always import from `@/components/ui/...` |
| `baseUrl is deprecated` | Newer TypeScript | Removed `baseUrl`, kept `paths` |
| Login failed and `/api/health` answered 401 | Port 4000 was used by another project | Stopped it, restarted the Kanbot server |
| Auth card not vertically centered | Leftover Vite template styles | Removed them, layout uses `min-h-dvh` |
| "Session expired" toast shown twice | React StrictMode runs effects twice in development | Fixed toast `id` |
| User signed out whenever the server was down (found later) | The bootstrap cleared the session on any error | Only a 401 ends the session; other errors show Try again and Log out |
| Two "show password" controls in Edge | Edge adds its own reveal icon to password fields | Hidden with `input::-ms-reveal` |
| Wrong-color flash when opening the app in dark mode | The theme was applied only after React loaded | Inline script and root background in `index.html` |
| Blue tint on autofilled fields in light mode | Chrome's autofill styling | Neutralised in `index.css` |
| Labels looked glued to their inputs | `<label>` is inline, so vertical margins were ignored | Fields use `grid gap-2` |
| Outline buttons blended into the page | shadcn gives them the page color | Own `--control` surface and border |
| Fields looked transparent over the page | shadcn fields are transparent | Fields use the `--field` surface |
