import { format, parseISO } from "date-fns"

/* parseISO reads "YYYY-MM-DD" as a LOCAL date (new Date("2026-11-03") would be UTC and can shift a day). */
function formatOne(value: string): string {
    const date = parseISO(value)
    const sameYear = date.getFullYear() === new Date().getFullYear()
    return format(date, sameYear ? "MMM d" : "MMM d, yyyy")
}

/* "Nov 3" (or "Nov 3, 2027" when it is not the current year). */
export function formatDate(value: string | null | undefined): string {
    return value ? formatOne(value) : "No date"
}

/* "Nov 3 – Nov 16". Handles sprints that have only one date, or none. */
export function formatDateRange(start: string | null, end: string | null): string {
    if (start && end) return `${formatOne(start)} – ${formatOne(end)}`
    if (start) return `From ${formatOne(start)}`
    if (end) return `Until ${formatOne(end)}`
    return "No dates set"
}