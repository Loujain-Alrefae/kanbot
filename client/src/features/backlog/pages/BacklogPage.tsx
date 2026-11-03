import { useParams } from "react-router"
import { PageHeader } from "@/components/layout/PageHeader"
import { useSprints } from "@/hooks/useSprints"
import { useAllTodos, useBacklogTodos } from "@/hooks/useTodos"

export function BacklogPage() {
    const { projectId } = useParams()
    const all = useAllTodos(projectId)
    const backlog = useBacklogTodos(projectId, {})
    const sprints = useSprints(projectId)

    return (
        <>
        <PageHeader title="Backlog" />
        <pre className="p-6 text-sm">
            {JSON.stringify(
            {
                allTodos: all.data?.length,
                backlogTodos: backlog.data?.length,
                sprints: sprints.data?.map((s) => `${s.name} (${s.status})`),
                errors: [all.error?.message, backlog.error?.message, sprints.error?.message].filter(Boolean),
            },
            null,
            2,
            )}
        </pre>
        </>
    )
}