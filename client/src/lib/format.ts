import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns"

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

/* Date-only strings ("YYYY-MM-DD") for <input type="date"> and the API. Local time, never UTC. */
export function toISODate(date: Date): string {
    return format(date, "yyyy-MM-dd")
}

export function todayISO(): string {
    return toISODate(new Date())
}

export function addDaysISO(value: string, days: number): string {
    return toISODate(addDays(parseISO(value), days))
}

/* "6 days left", "1 day left", "Ends today", "Overdue by 2 days". Counts calendar days, so the time of day never matters. */
export function daysLeftLabel(endDate: string | null): string {
    if (!endDate) return "No end date"
    const days = differenceInCalendarDays(parseISO(endDate), new Date())
    if (days > 1) return `${days} days left`
    if (days === 1) return "1 day left"
    if (days === 0) return "Ends today"
    const late = Math.abs(days)
    return `Overdue by ${late} ${late === 1 ? "day" : "days"}`
}