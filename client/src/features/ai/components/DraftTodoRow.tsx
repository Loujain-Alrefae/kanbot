import { OptionSelect } from "@/components/OptionSelect"
import type { SelectOption } from "@/components/OptionSelect"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { POINTS_OPTIONS, PRIORITY_OPTIONS, TYPE_OPTIONS } from "@/lib/todo"
import { TODO_PRIORITIES, TODO_TYPES } from "@/types/api"
import type { Draft } from "../lib/drafts"
import { draftError } from "../lib/drafts"

const NONE = "none"
const POINT_OPTIONS: SelectOption[] = [
    { value: NONE, label: "None" },
    ...POINTS_OPTIONS.map((points) => ({ value: String(points), label: String(points) })),
]

interface DraftTodoRowProps {
    draft: Draft
    index: number
    disabled?: boolean
    onChange: (patch: Partial<Draft>) => void
}

export function DraftTodoRow({ draft, index, disabled, onChange }: DraftTodoRowProps) {
    const error = draft.selected ? draftError(draft) : null
    const n = index + 1

    return (
        <li className="rounded-lg border bg-muted/50 p-2">
        <div className="flex flex-wrap items-center gap-2">
            <Checkbox
            checked={draft.selected}
            onCheckedChange={(checked) => onChange({ selected: checked })}
            disabled={disabled}
            aria-label={`Select todo ${n}`}
            />
            <Input
            value={draft.title}
            onChange={(event) => onChange({ title: event.target.value })}
            disabled={disabled}
            aria-label={`Title of todo ${n}`}
            aria-invalid={error ? true : undefined}
            className="min-w-48 flex-1"
            />
            <OptionSelect
            aria-label={`Type of todo ${n}`}
            value={draft.type}
            options={TYPE_OPTIONS}
            disabled={disabled}
            onChange={(value) => onChange({ type: TODO_TYPES.find((t) => t === value) ?? draft.type })}
            className="w-28"
            />
            <OptionSelect
            aria-label={`Priority of todo ${n}`}
            value={draft.priority}
            options={PRIORITY_OPTIONS}
            disabled={disabled}
            onChange={(value) => onChange({ priority: TODO_PRIORITIES.find((p) => p === value) ?? draft.priority })}
            className="w-28"
            />
            <OptionSelect
            aria-label={`Story points of todo ${n}`}
            value={draft.storyPoints === null ? NONE : String(draft.storyPoints)}
            options={POINT_OPTIONS}
            disabled={disabled}
            onChange={(value) => onChange({ storyPoints: POINTS_OPTIONS.find((p) => String(p) === value) ?? null })}
            className="w-24"
            />
        </div>
        {error && (
            <p role="alert" className="mt-1 pl-6 text-xs text-destructive-text">
            {error}
            </p>
        )}
        </li>
    )
}