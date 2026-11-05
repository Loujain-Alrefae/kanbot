import { useState } from "react"
import type { FormEvent } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAiStatus, useGenerateTodos } from "@/hooks/useAi"
import { useBulkCreateTodos } from "@/hooks/useTodos"
import { sumPoints } from "@/lib/todo"
import { draftError, toCreateRequests, toDrafts } from "../lib/drafts"
import type { Draft } from "../lib/drafts"
import { AiBadge } from "./AiBadge"
import { AiButton } from "./AiButton"
import { AiDisclaimer } from "./AiDisclaimer"
import { AiError } from "./AiError"
import { DraftTodoRow } from "./DraftTodoRow"

const MIN_PROMPT = 3
const MAX_PROMPT = 2000
const MAX_COUNT = 10

/* Mount only while open ({generateOpen && <GenerateTodosDialog … />}): every opening starts fresh. */
export function GenerateTodosDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
    const navigate = useNavigate()
    const status = useAiStatus()
    const generate = useGenerateTodos(projectId)
    const save = useBulkCreateTodos(projectId)

    const [prompt, setPrompt] = useState("")
    const [count, setCount] = useState("5")
    const [drafts, setDrafts] = useState<Draft[] | null>(null)

    const trimmed = prompt.trim()
    const countNumber = Number(count)
    const countValid = Number.isInteger(countNumber) && countNumber >= 1 && countNumber <= MAX_COUNT
    const promptValid = trimmed.length >= MIN_PROMPT && trimmed.length <= MAX_PROMPT
    const canGenerate = promptValid && countValid && !generate.isPending && !save.isPending

    const selected = drafts?.filter((draft) => draft.selected) ?? []
    const hasInvalid = selected.some((draft) => draftError(draft) !== null)
    const blockReason =
        selected.length === 0
        ? "Select at least one todo."
        : hasInvalid
            ? "Every selected todo needs a title of 1–200 characters."
            : null

    function runGenerate() {
        if (!canGenerate) return
        // A new result replaces the current list.
        generate.mutate(
        { prompt: trimmed, count: countNumber },
        { onSuccess: (response) => setDrafts(toDrafts(response.todos)) },
        )
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        runGenerate()
    }

    function updateDraft(id: string, patch: Partial<Draft>) {
        setDrafts((current) => current?.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)) ?? null)
    }

    function setAllSelected(value: boolean) {
        setDrafts((current) => current?.map((draft) => ({ ...draft, selected: value })) ?? null)
    }

    function handleSave() {
        if (blockReason) return
        save.mutate(toCreateRequests(selected), {
        onSuccess: () => {
            onClose()
            navigate(`/projects/${projectId}/backlog`)
        },
        })
    }

    const allSelected = drafts !== null && drafts.length > 0 && drafts.every((draft) => draft.selected)

    return (
        <Dialog
        open
        onOpenChange={(open) => {
            if (!open && !save.isPending) onClose()
        }}
        >
        <DialogContent className="flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-[min(56rem,calc(100%-4rem))]">
            <DialogHeader className="shrink-0 flex-row flex-wrap items-center gap-2 border-b px-6 py-4 pr-12 text-left">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <DialogTitle>Generate todos with AI</DialogTitle>
            <AiBadge />
            <DialogDescription className="sr-only">Describe a feature and review the suggested todos</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                <label htmlFor="ai-feature" className="text-sm font-medium">
                    Describe the feature
                </label>
                <Textarea
                    id="ai-feature"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    maxLength={MAX_PROMPT}
                    rows={4}
                    placeholder="e.g. User profile page with avatar upload"
                    className="resize-y"
                />
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Drafts are not saved until you add them.</p>
                    {status.data?.mode === "mock" && (
                    <p className="text-xs text-muted-foreground">
                        Mock AI: put one item per line to get one todo per line.
                    </p>
                    )}
                </div>
                <div className="flex items-end gap-3">
                    <div className="space-y-1">
                    <label htmlFor="ai-count" className="text-xs font-medium">
                        How many (1–{MAX_COUNT})
                    </label>
                    <Input
                        id="ai-count"
                        type="number"
                        min={1}
                        max={MAX_COUNT}
                        value={count}
                        onChange={(event) => setCount(event.target.value)}
                        aria-invalid={countValid ? undefined : true}
                        className="w-24"
                    />
                    </div>
                    <AiButton type="submit" disabled={!canGenerate}>
                    {generate.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Generate
                    </AiButton>
                </div>
                </div>
                {!promptValid && trimmed.length > 0 && (
                <p className="text-xs text-muted-foreground">Write at least {MIN_PROMPT} characters.</p>
                )}
            </form>

            {generate.isPending && (
                <div aria-busy="true" className="space-y-2">
                <span className="sr-only" role="status">
                    Generating todos…
                </span>
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-secondary" />
                ))}
                </div>
            )}

            {generate.isError && !generate.isPending && <AiError error={generate.error} onRetry={runGenerate} />}

            {drafts && !generate.isPending && !generate.isError && (
                <section aria-labelledby="drafts-heading" className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <h3 id="drafts-heading" className="text-sm font-semibold">
                    Suggested todos ({drafts.length})
                    </h3>
                    {drafts.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAllSelected(!allSelected)}>
                        {allSelected ? "Select none" : "Select all"}
                    </Button>
                    )}
                </div>

                {drafts.length === 0 ? (
                    <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                    The AI returned no todos. Try describing the feature in more detail.
                    </p>
                ) : (
                    <ul className="space-y-2">
                    {drafts.map((draft, index) => (
                        <DraftTodoRow
                        key={draft.id}
                        draft={draft}
                        index={index}
                        disabled={save.isPending}
                        onChange={(patch) => updateDraft(draft.id, patch)}
                        />
                    ))}
                    </ul>
                )}
                </section>
            )}

            {save.isError && <AiError error={save.error} onRetry={handleSave} retrying={save.isPending} />}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
            <div className="space-y-0.5">
                <p className="text-sm tabular-nums text-muted-foreground">{sumPoints(selected)} pts total</p>
                {drafts && blockReason && <p className="text-xs text-muted-foreground">{blockReason}</p>}
                <AiDisclaimer />
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
                Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={!drafts || blockReason !== null || save.isPending}>
                {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Add {selected.length} selected to backlog
                </Button>
            </div>
            </div>
        </DialogContent>
        </Dialog>
    )
}