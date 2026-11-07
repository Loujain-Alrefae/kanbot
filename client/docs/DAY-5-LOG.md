# Day 5: The AI Assistant (Feature Reference)

**Scope:** the AI chat drawer, generating todos, planning a sprint, summarizing a sprint, and the loading, error and mode states around them.
**Requirements covered:** AI-1, AI-2, AI-3, AI-4, AI-5. **Extras:** suggested questions per page, chat history per project, "Improve with AI" on a todo.
**Status:** complete and verified manually.

This document describes, feature by feature, what was implemented, where it lives and how to verify it.

## At a glance

| Feature | Requirement | Main files |
|---|---|---|
| 1. AI data layer and host | AI-1 … AI-5 | `api/ai.ts`, `features/ai/` hooks, `AiHost.tsx` |
| 2. Chat drawer | AI-1 | `features/ai/` drawer components |
| 3. Generate todos | AI-2 | generate-todos dialog |
| 4. Plan sprint | AI-3 | plan-sprint dialog |
| 5. Sprint summary | AI-4 | summary card, Summarize button, complete-dialog option |
| 6. States, errors and Mock AI | AI-5 | shared AI state components |
| 7. Extras | extras | suggested questions, chat history, Improve with AI |

---

## 1. AI data layer and host

**What was implemented**
- `api/ai.ts` wraps the AI endpoints with the contract types: `GET /ai/status`, `POST /projects/:id/ai/generate-todos`, `POST /projects/:id/ai/plan-sprint`, `POST /projects/:id/ai/chat` and `POST /sprints/:id/ai/summary`.
- **`AiHost`** is mounted **once inside `AppShell`**. The drawer and the dialogs live there, and any button on any page opens them through a small store (for example **Ask AI** in the page header, **Generate todos with AI** and **Plan sprint with AI** in the Backlog toolbar, **Summarize** on the board).
- `GET /ai/status` tells the UI whether the server runs the built-in simulator (`mock`) or a real model (`ai`).

**How to verify:** open the AI from three different pages; the same drawer appears.

## 2. Chat drawer (AI-1)

**Behavior**
- A right-side drawer titled **Kanbot Assistant**, opened from the Ask AI button on any screen.
- **Quick actions** at the top: Create todos, Plan sprint, Summarize sprint.
- **Messages:** user messages on the right, assistant messages on the left. Assistant replies are **Markdown** rendered with `react-markdown` (no raw HTML is allowed, NFR-7).
- **The API is stateless**, so the whole conversation (up to 30 messages, each up to 4000 characters, ending with a user message) is sent with every request.
- **Enter** sends and **Shift+Enter** adds a new line. While waiting, a "thinking…" indicator is shown and Send is disabled.
- The conversation resets when the project changes and through a **New chat** action.
- A permanent note: "AI can make mistakes. Review before saving."

## 3. Generate todos (AI-2)

**Behavior**
- A dialog: **Describe the feature** (3–2000 characters), an optional count (1–10, default 5) and **Generate**.
- Results appear as **draft todos** in an editable table: a checkbox, title, type, priority and story points for each. Every field can be edited and **Select all** is available. The footer shows the total points and the button **Add N selected to backlog**.
- **Nothing is saved until the user presses the add button.** The selected drafts are saved in one request (`POST /projects/:id/todos/bulk`), the backlog refreshes and a toast confirms.
- The note "Drafts are not saved until you add them" is always visible.

## 4. Plan sprint (AI-3)

**Behavior**
- A dialog with **Capacity** (story points, 1–200) and an optional **Focus**, then **Suggest plan**.
- The result shows the **suggested sprint goal**, the proposed backlog todos with checkboxes (key, title, points), a **total versus capacity** bar and the **reasoning** text from the AI. Todos can be unchecked and the total updates.
- **Create sprint with N todos** creates the sprint with the chosen todo ids and the suggested goal (`POST` sprints with `todoIds`). The new sprint appears as a planned sprint; the AI never starts it.

## 5. Sprint summary (AI-4)

- **Summarize** on the board header, an option **Generate AI summary** in the complete-sprint dialog, and an **AI Summary** card on the sprint details page.
- The server saves the summary on the sprint, so it is still there after a reload and for completed sprints.
- The card renders the Markdown (highlights, what was not finished, suggestions), a **Regenerate** button and a line saying when and by which mode it was generated.

## 6. States, errors and Mock AI (AI-5)

- Every AI action has a **loading** state (disabled controls and a visible indicator) and an **error** state with **Try again**. A `502` (the provider failed) and a `429` (too many requests) show their own readable messages.
- A badge **Mock AI** is visible whenever the server runs the simulator, so the user always knows what produced the answer.
- AI output is never trusted blindly: drafts and plans are validated and edited before anything is saved.
- **One visual identity for AI.** Every AI action (Ask AI, Summarize, Generate todos with AI, Plan sprint with AI, Improve with AI) uses the indigo tint (`.ai-btn`, wrapped by a small `AiButton` component), clearly different from the solid indigo used for the main action of a screen. The sparkle icon pulses while any AI request is running (`.ai-spark-working`) and stays still for users who prefer reduced motion.

## 7. Extras

- **Suggested questions per page.** The drawer offers starter questions that depend on the screen the user is on (backlog, board or sprints).
- **Chat history per project.** Because the chat API is stateless, each project's conversation is kept in `localStorage` (a client-side simulation) and is cleared when the user logs out.
- **Improve with AI** in the todo details dialog. The button asks the assistant to improve the todo; the result is a suggestion for the user to review, and nothing is saved until Save is pressed.

---

## Verification

| Test | Expected | Result |
|---|---|---|
| Open the drawer from the Backlog, the board and Sprints | Same drawer on every page | Pass |
| Send three messages back and forth | Replies render as Markdown; history is sent each time | Pass |
| Switch project | The conversation resets | Pass |
| Generate five todos; uncheck two; edit one; add | Exactly the three selected appear in the backlog | Pass |
| Close the generate dialog without adding | Nothing is saved | Pass |
| Plan a sprint with capacity 10 | Total stays within capacity; unchecking updates it | Pass |
| Create the planned sprint | It appears as a planned sprint with the chosen todos | Pass |
| Summarize the active sprint; reload | The summary persists | Pass |
| Regenerate the summary | A new text and a new time | Pass |
| Complete a sprint with "Generate AI summary" | The summary appears on the sprint's page | Pass |
| Server stopped or AI error | Error state with Try again | Pass |
| Mock AI badge | Visible while the simulator is active | Pass |
| Log out and log in again | Previous chat history is gone | Pass |

## Decisions

| Decision | Reason |
|---|---|
| One `AiHost` in `AppShell`, controlled by a store | Any button on any page can open the AI without prop drilling |
| Drafts and plans are never saved automatically | The user must stay in control (AI-2, AI-3) |
| Whole conversation sent each time | The API is stateless |
| Markdown without raw HTML | NFR-7 |
| Chat history in `localStorage`, cleared on logout | The API keeps no history; the choice is documented as a simulation |
| Visible Mock AI badge | Honest about what produced the answer |
