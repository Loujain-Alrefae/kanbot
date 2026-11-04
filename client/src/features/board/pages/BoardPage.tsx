import { useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"
import { EmptyState } from "@/components/EmptyState"
import { ErrorState } from "@/components/ErrorState"
import { PageHeader } from "@/components/layout/PageHeader"
import { buttonVariants } from "@/components/ui/button"
import { TodoDetailsDialog } from "@/features/todos/components/TodoDetailsDialog"
import { useActiveSprint, useSprintBoard } from "@/hooks/useSprints"
import { boardTotals } from "@/lib/board"
import { END_OF_LIST, STATUS_LABELS } from "@/lib/todo"
import { TODO_STATUSES } from "@/types/api"
import type { Todo, TodoStatus } from "@/types/api"
import { useBoardMove } from "../hooks/useBoardMove"
import { BoardColumn } from "../components/BoardColumn"
import { BoardSkeleton } from "../components/BoardSkeleton"
import { SprintHeader } from "../components/SprintHeader"

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

  // One mutation for the whole page (not one per card). Step 4's drag and drop will use the same one.
  const moveTodo = useBoardMove(active.data?.id)

  function handleOpenTodo(todo: Todo) {
    setSelectedTodoId(todo.id)
  }

  // From the card menu: the card goes to the END of the target column, like a status change in the details dialog.
  function handleMoveTodo(todo: Todo, status: TodoStatus) {
    if (todo.status === status) return
    moveTodo.mutate(
      { id: todo.id, body: { status, position: END_OF_LIST } },
      { onSuccess: () => toast.success(`${todo.key} moved to ${STATUS_LABELS[status]}`) },
    )
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
    const { sprint, columns } = board.data
    content = (
      <>
        {/* Step 6 adds "Complete sprint" here, Day 5 adds "Summarize". No dead buttons before then. */}
        <SprintHeader sprint={sprint} totals={boardTotals(columns)} />

        {/* Scrollable region: below ~1024px the four columns scroll sideways (NFR-4). It is focusable so
            keyboard users can scroll it with the arrow keys. */}
        <div
          role="region"
          aria-label="Sprint board"
          tabIndex={0}
          className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TODO_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              todos={columns[status]}
              onOpenTodo={handleOpenTodo}
              onMoveTodo={handleMoveTodo}
            />
          ))}
        </div>
      </>
    )
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