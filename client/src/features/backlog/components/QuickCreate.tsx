import { useRef, useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { fieldErrors } from "@/api/client"
import { Input } from "@/components/ui/input"
import { useCreateTodo } from "@/hooks/useTodos"
import { QUICK_CREATE_INPUT_ID } from "../constants"

// Same limits as the server (CreateTodoRequest.title: 1-200 chars).
const titleSchema = z.string().trim().min(1, "Enter a title").max(200, "Title must be 200 characters or fewer")

const ERROR_ID = "quick-create-error"

interface QuickCreateProps {
    projectId: string
    filtersActive?: boolean
}

export function QuickCreate({ projectId, filtersActive = false }: QuickCreateProps) {
    const [title, setTitle] = useState("")
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const createTodo = useCreateTodo(projectId)

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // A second Enter while the first request is running must not create a duplicate.
    if (createTodo.isPending) return

    const parsed = titleSchema.safeParse(title)
    if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Enter a valid title")
        return
    }

    // Defaults (task, medium, no points, backlog, end of the list) come from the server.
    createTodo.mutate(
        { title: parsed.data },
        {
        onSuccess: () => {
            setTitle("")
            setError(null)
            toast.success("Todo created", {
                id: "todo-created",
                description: filtersActive ? "It may be hidden by your current filters." : undefined,
            })
          // The list just grew above this field: keep it in view so the next title can be typed.
            requestAnimationFrame(() => inputRef.current?.scrollIntoView({ block: "nearest" }))
        },
        onError: (err) => {
          // A server validation error belongs under the field; anything else (network, 500) is a toast.
          // The typed title stays in the field so the user does not lose it.
            const message = fieldErrors(err).title
            if (message) setError(message)
            else toast.error(err.message)
        },
        },
    )
    }
    
    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
        setTitle("")
        setError(null)
        }
    }

    return (
    <form onSubmit={handleSubmit} noValidate className="border-t border-dashed px-4 py-3">
        <div className="flex items-center gap-3">
        <label htmlFor={QUICK_CREATE_INPUT_ID} className="flex shrink-0 items-center gap-1 text-sm font-medium">
            <Plus className="size-4" aria-hidden="true" />
            Create todo
        </label>

        <Input
            ref={inputRef}
            id={QUICK_CREATE_INPUT_ID}
            value={title}
            onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError(null)
            }}
            onKeyDown={handleKeyDown}
            // readOnly (not disabled): a disabled input loses focus, which would break typing the next todo.
            readOnly={createTodo.isPending}
            placeholder="Type a title and press Enter"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ERROR_ID : undefined}
            className="h-8 flex-1"
        />

        {/* Fixed-size slot so the input does not change width when the spinner appears. */}
        <span className="size-4 shrink-0">
            {createTodo.isPending && (
                <>
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
                <span role="status" className="sr-only">
                    Creating todo…
                </span>
                </>
            )}
            </span>
        </div>

        {error && (
            <p id={ERROR_ID} role="alert" className="mt-1.5 text-sm text-destructive-text">
            {error}
            </p>
        )}
        </form>
    )
}