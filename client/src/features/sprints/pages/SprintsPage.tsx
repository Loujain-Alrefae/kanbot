import type { ReactNode } from "react"
import { Link, useParams } from "react-router"
import { EmptyState } from "@/components/EmptyState"
import { ErrorState } from "@/components/ErrorState"
import { PageHeader } from "@/components/layout/PageHeader"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSprints } from "@/hooks/useSprints"
import { SprintDetails } from "../components/SprintDetails"
import { SprintListItem } from "../components/SprintListItem"

export function SprintsPage() {
    const { projectId } = useParams()
    if (!projectId) return null // the route always has :projectId; this only narrows the type

    // key = projectId: switching projects remounts the page and resets everything local.
    return <SprintsView key={projectId} projectId={projectId} />
    }

    function SprintsView({ projectId }: { projectId: string }) {
    const { sprintId } = useParams() // the selected sprint lives in the URL, so it survives a reload
    const sprints = useSprints(projectId)

    let meta: string | undefined
    let content: ReactNode

    if (sprints.isError) {
        content = <ErrorState message={sprints.error.message} onRetry={() => sprints.refetch()} />
    } else if (sprints.isPending) {
        content = (
        <div className="grid gap-6 lg:grid-cols-[minmax(16rem,22rem)_1fr]" aria-hidden="true">
            <div className="space-y-3">
            {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full bg-secondary" />
            ))}
            </div>
            <Skeleton className="h-96 w-full bg-secondary" />
        </div>
        )
    } else if (sprints.data.length === 0) {
        content = (
        <EmptyState
            title="No sprints yet"
            description="Create a sprint in the backlog to start planning your work."
            action={
            <Link to={`/projects/${projectId}/backlog`} className={buttonVariants()}>
                Go to backlog
            </Link>
            }
        />
        )
    } else {
        const list = sprints.data
        meta = `${list.length} ${list.length === 1 ? "sprint" : "sprints"}`

        // No id in the URL = the first sprint (the server sorts: active, planned, then completed newest first).
        const selected = sprintId ? list.find((sprint) => sprint.id === sprintId) : list[0]

        content = (
        <div className="grid gap-6 lg:grid-cols-[minmax(16rem,22rem)_1fr] lg:items-start">
            <nav aria-label="All sprints">
            <h2 className="mb-3 text-sm font-medium">All sprints</h2>
            <ul className="space-y-3">
                {list.map((sprint) => (
                <li key={sprint.id}>
                    <SprintListItem sprint={sprint} selected={sprint.id === selected?.id} />
                </li>
                ))}
            </ul>
            </nav>

            {selected ? (
            <SprintDetails key={selected.id} sprint={selected} />
            ) : (
            <EmptyState
                title="Sprint not found"
                description="This sprint doesn't exist in this project."
                action={
                <Link to={`/projects/${projectId}/sprints`} className={buttonVariants()}>
                    Show all sprints
                </Link>
                }
            />
            )}
        </div>
        )
    }

    return (
        <>
        <PageHeader title="Sprints" meta={meta} />
        <div className="p-6">{content}</div>
        </>
    )
}