import { useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router"
import { EmptyState } from "@/components/EmptyState"
import { ErrorState } from "@/components/ErrorState"
import { PageHeader } from "@/components/layout/PageHeader"
import { buttonVariants } from "@/components/ui/button"
import { TodoDetailsDialog } from "@/features/todos/components/TodoDetailsDialog"
import { useActiveSprint, useSprintBoard } from "@/hooks/useSprints"
import type { Todo } from "@/types/api"
import { BoardSkeleton } from "../components/BoardSkeleton"
import { SprintBoard } from "../components/SprintBoard"

export function BoardPage() {
  const { projectId } = useParams()
  if (!projectId) return null // the route always has :projectId; this only narrows the type

  // key = projectId: switching projects remounts the view, so an open dialog never leaks into the next project.
  return <BoardView key={projectId} projectId={projectId} />
}

function BoardView({ projectId }: { projectId: string }) {
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)

  // The board needs the active sprint's id first, so this is one unavoidable hop (the sprint list is usually
  // already cached from the backlog page, which makes it instant).
  const active = useActiveSprint(projectId)
  const board = useSprintBoard(active.data?.id)

  function handleOpenTodo(todo: Todo) {
    setSelectedTodoId(todo.id)
  }

  // Order matters: every error is checked BEFORE its data, so stale cached data is never shown after a failure.
  let content: ReactNode
  if (active.isPending) {
    content = <BoardSkeleton />
  } else if (active.isError) {
    content = <ErrorState message={active.error.message} onRetry={() => active.refetch()} />
  } else if (active.data === null) {
    content = (
      <EmptyState
        title="No active sprint"
        description="Plan a sprint in the backlog and start it to see your board here."
        action={
          <Link to={`/projects/${projectId}/backlog`} className={buttonVariants()}>
            Go to backlog
          </Link>
        }
      />
    )
  } else if (board.isPending) {
    content = <BoardSkeleton />
  } else if (board.isError) {
    content = <ErrorState message={board.error.message} onRetry={() => board.refetch()} />
  } else {
    // Step 6 adds "Complete sprint" to the header, Day 5 adds "Summarize". No dead buttons before then.
    content = <SprintBoard board={board.data} onOpenTodo={handleOpenTodo} />
  }

  return (
    <>
      <PageHeader title="Active Sprint" />
      <div className="space-y-4 p-6">{content}</div>

      {selectedTodoId && (
        <TodoDetailsDialog projectId={projectId} todoId={selectedTodoId} onClose={() => setSelectedTodoId(null)} />
      )}
    </>
  )
}