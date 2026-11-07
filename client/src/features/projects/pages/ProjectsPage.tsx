import { useMemo, useState } from "react"
import { FolderPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/EmptyState"
import { ErrorState } from "@/components/ErrorState"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { useDeleteProject, useProjects } from "@/hooks/useProjects"
import type { ProjectWithStats } from "@/types/api"
import { ProjectCard } from "../components/ProjectCard"
import { ProjectDialog } from "../components/ProjectDialog"

type DialogState = { mode: "create" } | { mode: "edit"; project: ProjectWithStats } | null

export function ProjectsPage() {
    const { data, isPending, isError, error, refetch } = useProjects()
    const projects = isError ? undefined : data
    const deleteProject = useDeleteProject()

    const [search, setSearch] = useState("")
    const [dialog, setDialog] = useState<DialogState>(null)
    const [toDelete, setToDelete] = useState<ProjectWithStats | null>(null)

  // Search is a local filter over the loaded list (name, key, description).
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!projects || !q) return projects ?? []
        return projects.filter((p) => [p.name, p.key, p.description].some((v) => v.toLowerCase().includes(q)))
    }, [projects, search]
    )

    const newProjectButton = (
        <Button onClick={() => setDialog({ mode: "create" })}>
        <Plus className="size-4" aria-hidden="true" />
        New project
        </Button>
    )

    const count = projects?.length ?? 0
    const meta = projects ? `${count} ${count === 1 ? "project" : "projects"}` : undefined

    return (
        <>
        <PageHeader title="Projects" meta={meta} actions={newProjectButton} />

        <div className="space-y-6 p-6">
            {isPending && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading projects">
                {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
            </div>
            )}

            {isError && <ErrorState message={error.message} onRetry={() => refetch()} />}

            {projects && projects.length === 0 && (
            <EmptyState
                icon={<FolderPlus className="size-6" aria-hidden="true" />}
                title="No projects yet"
                description="Create your first project to start planning sprints."
                action={newProjectButton}
            />
            )}

            {projects && projects.length > 0 && (
            <>
                <Input
                type="search"
                value={search}
                data-hotkey="search"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                aria-label="Search projects"
                className="h-10 max-w-xs"
                />

                {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    No projects match &ldquo;{search.trim()}&rdquo;.
                </p>
                ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={(p) => setDialog({ mode: "edit", project: p })}
                        onDelete={setToDelete}
                    />
                    ))}
                    <button
                    type="button"
                    onClick={() => setDialog({ mode: "create" })}
                    className="flex min-h-44 items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                    <Plus className="size-4" aria-hidden="true" />
                    New project
                    </button>
                </div>
                )}
            </>
            )}
        </div>

        <ProjectDialog
            open={dialog !== null}
            onOpenChange={(open) => !open && setDialog(null)}
            project={dialog?.mode === "edit" ? dialog.project : undefined}
        />

        <ConfirmDialog
            open={toDelete !== null}
            onOpenChange={(open) => !open && setToDelete(null)}
            title="Delete project?"
            description={`This will permanently delete “${toDelete?.name ?? ""}” and all of its todos and sprints. This cannot be undone.`}
            confirmLabel="Delete project"
            loading={deleteProject.isPending}
            onConfirm={() => toDelete && deleteProject.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        />
        </>
    )
}