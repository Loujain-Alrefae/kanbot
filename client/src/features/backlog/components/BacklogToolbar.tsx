import { Search, X } from "lucide-react"
import { OptionSelect } from "@/components/OptionSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PRIORITY_OPTIONS, TYPE_OPTIONS } from "@/lib/todo"
import { hasActiveFilters, parsePriorityFilter, parseTypeFilter } from "../filters"
import type { FilterState } from "../filters"

const PRIORITY_FILTER_OPTIONS = [{ value: "all", label: "All priorities" }, ...PRIORITY_OPTIONS]
const TYPE_FILTER_OPTIONS = [{ value: "all", label: "All types" }, ...TYPE_OPTIONS]

interface BacklogToolbarProps {
    filters: FilterState
    onChange: (patch: Partial<FilterState>) => void
    onClear: () => void
}

export function BacklogToolbar({ filters, onChange, onClear }: BacklogToolbarProps) {
    return (
        <div role="search" aria-label="Filter backlog" className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
            <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
            />
            <Input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search todos…"
            aria-label="Search todos"
            autoComplete="off"
            className="pl-8"
            />
        </div>

        <OptionSelect
            aria-label="Filter by priority"
            value={filters.priority}
            options={PRIORITY_FILTER_OPTIONS}
            onChange={(value) => onChange({ priority: parsePriorityFilter(value) })}
            className="w-44"
        />
        <OptionSelect
            aria-label="Filter by type"
            value={filters.type}
            options={TYPE_FILTER_OPTIONS}
            onChange={(value) => onChange({ type: parseTypeFilter(value) })}
            className="w-36"
        />

        {hasActiveFilters(filters) && (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X className="size-4" aria-hidden="true" />
            Clear filters
            </Button>
        )}

        {/* Step 8: "+ Create sprint" goes at the end of this row. Day 6: the AI buttons too. */}
        </div>
    )
}