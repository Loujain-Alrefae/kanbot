import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import { fieldErrors } from "@/api/client"
import { Field, describe } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useStartSprint } from "@/hooks/useSprints"
import { addDaysISO, todayISO } from "@/lib/format"
import type { Sprint } from "@/types/api"

const DEFAULT_SPRINT_DAYS = 14 // SPR-3: the end date defaults to the start date + 14 days
const DATE = /^\d{4}-\d{2}-\d{2}$/

const startSchema = z
    .object({
        startDate: z.string().regex(DATE, "Choose a start date"),
        endDate: z.string().regex(DATE, "Choose an end date"),
    })
    .refine((values) => values.endDate >= values.startDate, {
        path: ["endDate"],
        message: "End date must be on or after the start date",
    })

type StartValues = z.infer<typeof startSchema>

interface StartSprintDialogProps {
    projectId: string
    sprint: Sprint
    /** If another sprint is active, starting is blocked (the server would answer 409 anyway). */
    activeSprint: Sprint | undefined
    onClose: () => void
}

export function StartSprintDialog({ projectId, sprint, activeSprint, onClose }: StartSprintDialogProps) {
    const navigate = useNavigate()
    const startSprint = useStartSprint()
    const [formError, setFormError] = useState<string | null>(null)

    const [defaults] = useState<StartValues>(() => {
        const start = todayISO()
        return { startDate: start, endDate: addDaysISO(start, DEFAULT_SPRINT_DAYS) }
    })
    const form = useForm<StartValues>({ resolver: zodResolver(startSchema), defaultValues: defaults })
    const {
        register,
        formState: { errors },
    } = form
    const startDate = form.watch("startDate")

    const blockedMessage = activeSprint
        ? `${activeSprint.name} is already active. Complete it before starting another sprint.`
        : null
    const alertMessage = blockedMessage ?? formError

    function handleSubmit(values: StartValues) {
        setFormError(null)
        startSprint.mutate(
        { id: sprint.id, body: values },
        {
            onSuccess: () => {
            toast.success(`${sprint.name} started`)
            onClose()
            navigate(`/projects/${projectId}/board`)
            },
            onError: (err) => {
            // Date errors go under their field; everything else (409, 500, network) is shown inside this dialog.
            let shown = false
            for (const [path, message] of Object.entries(fieldErrors(err))) {
                if (path === "startDate" || path === "endDate") {
                form.setError(path, { type: "server", message })
                shown = true
                }
            }
            if (!shown) setFormError(err.message)
            },
        },
        )
    }

    return (
        <Dialog
        open
        onOpenChange={(open) => {
            if (!open && !startSprint.isPending) onClose()
        }}
        >
        <DialogContent className="gap-0 p-0 sm:max-w-md">
            <DialogHeader className="border-b px-6 py-4 pr-12 text-left">
            <DialogTitle>Start {sprint.name}</DialogTitle>
            <DialogDescription>
                Choose the sprint dates. Only one sprint can be active at a time.
            </DialogDescription>
            </DialogHeader>

            <form
            id="start-sprint-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="space-y-4 px-6 py-5"
            >
            {alertMessage && (
                <p
                role="alert"
                className="rounded-md border border-destructive-text/30 bg-destructive-subtle px-3 py-2 text-sm text-destructive-text"
                >
                {alertMessage}
                </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <Field id="start-startDate" label="Start date" error={errors.startDate?.message}>
                <Input
                    id="start-startDate"
                    type="date"
                    aria-invalid={errors.startDate ? true : undefined}
                    aria-describedby={describe("start-startDate", errors.startDate?.message)}
                    {...register("startDate")}
                />
                </Field>

                <Field id="start-endDate" label="End date" error={errors.endDate?.message}>
                <Input
                    id="start-endDate"
                    type="date"
                    min={startDate || undefined}
                    aria-invalid={errors.endDate ? true : undefined}
                    aria-describedby={describe("start-endDate", errors.endDate?.message)}
                    {...register("endDate")}
                />
                </Field>
            </div>
            </form>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={startSprint.isPending}>
                Cancel
            </Button>
            <Button type="submit" form="start-sprint-form" disabled={startSprint.isPending || blockedMessage !== null}>
                {startSprint.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Start sprint
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    )
}