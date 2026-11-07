import { daysLeftLabel, formatDateRange } from "@/lib/format"
import type { BoardColumns } from "@/lib/board"
import type { Sprint, Todo } from "@/types/api"

const MAX_PER_GROUP = 10
const DAY_MS = 24 * 60 * 60 * 1000

function line(todo: Todo): string {
  const points = todo.storyPoints === null ? "" : ` (${todo.storyPoints} pts)`
  const urgent = todo.priority === "urgent" ? " [urgent]" : ""
  return `- ${todo.key} ${todo.title.slice(0, 70)}${points}${urgent}`
}

function group(title: string, todos: Todo[]): string {
  if (todos.length === 0) return `${title}: none`
  const shown = todos.slice(0, MAX_PER_GROUP).map(line)
  const more = todos.length - shown.length
  return [`${title} (${todos.length}):`, ...shown, ...(more > 0 ? [`- …and ${more} more`] : [])].join("\n")
}

/* Builds the stand-up request from the board of the active sprint. Pure: `now` is a parameter so it can be tested. */
export function buildStandupPrompt(sprint: Sprint, columns: BoardColumns, now: number = Date.now()): string {
    const recentlyDone = columns.done.filter(
        (todo) => todo.completedAt !== null && new Date(todo.completedAt).getTime() >= now - DAY_MS,
    )
    const earlierDone = columns.done.length - recentlyDone.length

    return [
        "Write my daily stand-up for the sprint below, in Markdown, with three short sections: Yesterday, Today, Blockers.",
        "Use only this data and don't invent work. If nothing suggests a blocker, say so.",
        "",
        `Sprint: ${sprint.name} · ${formatDateRange(sprint.startDate, sprint.endDate)}${sprint.endDate ? ` · ${daysLeftLabel(sprint.endDate)}` : ""}`,
        sprint.goal ? `Goal: ${sprint.goal}` : "",
        "",
        group("Done in the last 24 hours", recentlyDone),
        `Done earlier in the sprint: ${earlierDone}`,
        "",
        group("In progress", columns.in_progress),
        "",
        group("In review", columns.in_review),
        "",
        `Still to do: ${columns.todo.length}`,
    ]
        .join("\n")
        .slice(0, 3900) // the API accepts up to 4000 characters per message
}