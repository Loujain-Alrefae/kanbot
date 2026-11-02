import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { ApiError, fieldErrors } from "@/api/client"
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects"
import type { Project } from "@/types/api"
import { projectSchema, type ProjectValues } from "./config"

const FIELDS = ["name", "key", "description"] as const
type Field = (typeof FIELDS)[number]

interface ProjectFormProps {
    project?: Project
    onDone: () => void
}

export function ProjectForm({ project, onDone }: ProjectFormProps) {
    const navigate = useNavigate()
    const createProject = useCreateProject()
    const updateProject = useUpdateProject()
    const [formError, setFormError] = useState<string | null>(null)
    const isEdit = Boolean(project)
    const pending = createProject.isPending || updateProject.isPending

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ProjectValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
        name: project?.name ?? "",
        key: project?.key ?? "",
        description: project?.description ?? "",
        },
    })

    // Keep the key uppercase while typing.
    const keyField = register("key")

    const handleError = (err: Error) => {
        // 409: the key is already used by another of your projects, so it belongs under the key field (PRJ-2).
        if (err instanceof ApiError && err.status === 409) {
        setError("key", { message: err.message })
        return
        }
        let matched = false
        for (const [name, message] of Object.entries(fieldErrors(err))) {
        if ((FIELDS as readonly string[]).includes(name)) {
            setError(name as Field, { message })
            matched = true
        }
        }
        if (!matched) setFormError(err.message)
    }

    const onSubmit = handleSubmit((values) => {
        setFormError(null)
        const body = { name: values.name, key: values.key || undefined, description: values.description }

        if (project) {
        updateProject.mutate({ id: project.id, body }, { onSuccess: onDone, onError: handleError })
        } else {
        createProject.mutate(body, {
            onSuccess: (created) => {
            onDone()
            navigate(`/projects/${created.id}/backlog`)
            },
            onError: handleError,
        })
        }
    })

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
            <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
            </div>
        )}

        <div className="space-y-1.5">
            <label htmlFor="project-name" className="text-sm font-medium">Name</label>
            <Input
            id="project-name"
            placeholder="e.g. Kanbot App"
            className="h-11"
            autoFocus
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "project-name-error" : undefined}
            {...register("name")}
            />
            {errors.name && <p id="project-name-error" className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
            <label htmlFor="project-key" className="text-sm font-medium">Key</label>
            <Input
            id="project-key"
            placeholder="Auto-generated"
            maxLength={6}
            autoComplete="off"
            className="h-11 uppercase"
            aria-invalid={errors.key ? true : undefined}
            aria-describedby="project-key-hint"
            {...keyField}
            onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
                keyField.onChange(e)
            }}
            />
            {errors.key ? (
            <p id="project-key-hint" className="text-sm text-destructive">{errors.key.message}</p>
            ) : (
            <p id="project-key-hint" className="text-sm text-muted-foreground">
                {isEdit
                ? "Changing the key does not change the keys of existing todos (KAN-12 stays KAN-12)."
                : "2–6 letters, used in todo keys like KAN-12. Leave empty to generate it from the name."}
            </p>
            )}
        </div>

        <div className="space-y-1.5">
            <label htmlFor="project-description" className="text-sm font-medium">Description</label>
            <Textarea
            id="project-description"
            rows={3}
            placeholder="What is this project about?"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? "project-description-error" : undefined}
            {...register("description")}
            />
            {errors.description && (
            <p id="project-description-error" className="text-sm text-destructive">{errors.description.message}</p>
            )}
        </div>

        <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
            Cancel
            </Button>
            <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
            </Button>
        </DialogFooter>
        </form>
    )
}