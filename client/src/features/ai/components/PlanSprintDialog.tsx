import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { AlertTriangle, Loader2, Sparkles } from "lucide-react"
import { useNavigate } from "react-router"
import { ErrorState } from "@/components/ErrorState"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PointsPill } from "@/features/todos/components/PointsPill"
import { usePlanSprint } from "@/hooks/useAi"
import { useCreateSprint } from "@/hooks/useSprints"
import { useBacklogTodos } from "@/hooks/useTodos"
import { sumPoints } from "@/lib/todo"
import type { PlanSprintResponse } from "@/types/api"
import { AiBadge } from "./AiBadge"
import { AiButton } from "./AiButton"
import { AiDisclaimer } from "./AiDisclaimer"
import { AiError } from "./AiError"

const MAX_TEXT = 300

interface Plan {
  /** Suggested todos first (in the AI's order), then the rest of the backlog. */
    order: string[]
    selected: Set<string>
    goal: string
    reasoning: string
    source: PlanSprintResponse["source"]
    capacity: number
}

/* Mount only while open ({planOpen && <PlanSprintDialog … />}): every opening starts fresh. */
export function PlanSprintDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
    const navigate = useNavigate()
    const backlog = useBacklogTodos(projectId, {}) // the same unfiltered list the backlog page shows (shared cache)
    const planSprint = usePlanSprint(projectId)
    const createSprint = useCreateSprint(projectId)

    const [capacity, setCapacity] = useState("30")
    const [focus, setFocus] = useState("")
    const [plan, setPlan] = useState<Plan | null>(null)

    const capacityNumber = Number(capacity)
    const capacityValid = Number.isInteger(capacityNumber) && capacityNumber >= 1 && capacityNumber <= 200
    const backlogEmpty = backlog.isSuccess && backlog.data.length === 0
    const canSuggest = capacityValid && backlog.isSuccess && !backlogEmpty && !planSprint.isPending && !createSprint.isPending

    const byId = useMemo(() => new Map((backlog.data ?? []).map((todo) => [todo.id, todo])), [backlog.data])

    function runSuggest() {
        if (!canSuggest) return
        planSprint.mutate(
        { capacity: capacityNumber, ...(focus.trim() && { focus: focus.trim() }) },
        {
            onSuccess: (response) => {
            // An id that is not in the backlog cache is ignored.
            const suggested = response.todoIds.filter((id) => byId.has(id))
            const rest = (backlog.data ?? []).map((todo) => todo.id).filter((id) => !suggested.includes(id))
            setPlan({
                order: [...suggested, ...rest],
                selected: new Set(suggested),
                goal: response.goal,
                reasoning: response.reasoning,
                source: response.source,
                capacity: capacityNumber,
            })
            },
        },
        )
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        runSuggest()
    }

    function toggle(id: string, checked: boolean) {
        setPlan((current) => {
        if (!current) return current
        const selected = new Set(current.selected)
        if (checked) selected.add(id)
        else selected.delete(id)
        return { ...current, selected }
        })
    }

    const selectedTodos = plan ? plan.order.filter((id) => plan.selected.has(id)).flatMap((id) => byId.get(id) ?? []) : []
    const total = sumPoints(selectedTodos)
    const over = plan ? total - plan.capacity : 0
    const percent = plan ? Math.min(100, Math.round((total / plan.capacity) * 100)) : 0

    function handleCreate() {
        if (!plan || selectedTodos.length === 0) return
        const goal = plan.goal.trim()
        createSprint.mutate(
        { ...(goal && { goal }), todoIds: selectedTodos.map((todo) => todo.id) },
        {
            onSuccess: () => {
            onClose()
            navigate(`/projects/${projectId}/backlog`)
            },
        },
        )
    }

    const busy = createSprint.isPending

    return (
        <Dialog
        open
        onOpenChange={(open) => {
            if (!open && !busy) onClose()
        }}
        >
        <DialogContent className="flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-[min(56rem,calc(100%-4rem))]">
            <DialogHeader className="shrink-0 flex-row flex-wrap items-center gap-2 border-b px-6 py-4 pr-12 text-left">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <DialogTitle>Plan sprint with AI</DialogTitle>
            <AiBadge />
            <DialogDescription className="sr-only">Suggest which backlog todos fit the next sprint</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                <label htmlFor="plan-capacity" className="text-sm font-medium">
                    Capacity (story points)
                </label>
                <Input
                    id="plan-capacity"
                    type="number"
                    min={1}
                    max={200}
                    value={capacity}
                    onChange={(event) => setCapacity(event.target.value)}
                    aria-invalid={capacityValid ? undefined : true}
                    className="w-32"
                />
                </div>
                <div className="min-w-48 flex-1 space-y-1">
                <label htmlFor="plan-focus" className="text-sm font-medium">
                    Focus / goal (optional)
                </label>
                <Input
                    id="plan-focus"
                    value={focus}
                    onChange={(event) => setFocus(event.target.value)}
                    maxLength={MAX_TEXT}
                    placeholder="e.g. finish user profile"
                    autoComplete="off"
                />
                </div>
                <AiButton type="submit" disabled={!canSuggest}>
                {planSprint.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Suggest plan
                </AiButton>
            </form>

            {!capacityValid && <p className="text-xs text-muted-foreground">Capacity must be a whole number from 1 to 200.</p>}
            {backlogEmpty && <p className="text-xs text-muted-foreground">Your backlog is empty: there is nothing to plan.</p>}
            {backlog.isError && <ErrorState message={backlog.error.message} onRetry={() => backlog.refetch()} />}
            {planSprint.isPending && (
                <p role="status" className="animate-pulse text-sm text-muted-foreground motion-reduce:animate-none">
                Planning your sprint…
                </p>
            )}
            {planSprint.isError && !planSprint.isPending && <AiError error={planSprint.error} onRetry={runSuggest} />}

            {plan && !planSprint.isPending && !planSprint.isError && (
                <div className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="plan-goal" className="text-sm font-medium">
                    Suggested sprint goal
                    </label>
                    <Input
                    id="plan-goal"
                    value={plan.goal}
                    maxLength={MAX_TEXT}
                    disabled={busy}
                    onChange={(event) => setPlan((current) => (current ? { ...current, goal: event.target.value } : current))}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <section aria-labelledby="plan-todos-heading" className="space-y-2">
                    <h3 id="plan-todos-heading" className="text-sm font-semibold">
                        Selected backlog todos
                    </h3>
                    <ul className="divide-y rounded-lg border bg-card">
                        {plan.order.map((id) => {
                        const todo = byId.get(id)
                        if (!todo) return null
                        return (
                            <li key={id}>
                            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                                <Checkbox
                                checked={plan.selected.has(id)}
                                onCheckedChange={(checked) => toggle(id, checked)}
                                disabled={busy}
                                />
                                <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">{todo.key}</span>
                                <span className="min-w-0 flex-1 truncate">{todo.title}</span>
                                <PointsPill points={todo.storyPoints} className="shrink-0" />
                            </label>
                            </li>
                        )
                        })}
                    </ul>

                    <div className="space-y-1.5 rounded-lg border bg-muted px-3 py-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium">Total</span>
                        <span className="tabular-nums">
                            {total} / {plan.capacity} pts
                        </span>
                        </div>
                        <div
                        role="progressbar"
                        aria-label="Planned points"
                        aria-valuemin={0}
                        aria-valuemax={plan.capacity}
                        aria-valuenow={Math.min(total, plan.capacity)}
                        className="h-2 overflow-hidden rounded-full bg-border"
                        >
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                        {over > 0 && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive-text">
                            <AlertTriangle className="size-3.5" aria-hidden="true" />
                            Over capacity by {over} pts
                        </p>
                        )}
                    </div>
                    </section>

                    <section aria-labelledby="plan-reasoning-heading" className="space-y-2">
                    <h3 id="plan-reasoning-heading" className="text-sm font-semibold">
                        Why this plan?
                    </h3>
                    <div className="rounded-lg border bg-muted p-3 text-sm">
                        <p className="mb-2 text-xs text-muted-foreground">
                        Reasoning ({plan.source === "mock" ? "Mock AI" : "AI"})
                        </p>
                        <p className="whitespace-pre-wrap wrap-break-word">{plan.reasoning}</p>
                    </div>
                    </section>
                </div>
                </div>
            )}

            {createSprint.isError && <AiError error={createSprint.error} onRetry={handleCreate} retrying={busy} />}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
            <AiDisclaimer />
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                Cancel
                </Button>
                <Button type="button" onClick={handleCreate} disabled={!plan || selectedTodos.length === 0 || busy}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Create sprint with {selectedTodos.length} {selectedTodos.length === 1 ? "todo" : "todos"}
                </Button>
            </div>
            </div>
        </DialogContent>
        </Dialog>
    )
}