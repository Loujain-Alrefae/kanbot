import { useQueryClient } from "@tanstack/react-query"

/* Refreshes everything a todo or sprint change can affect.
   Returning the promise keeps a mutation "pending" until the fresh data has arrived.
   Keys are matched by prefix: ["project"] does not touch ["projects"] and vice versa. */
export function useInvalidateWork() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["todos"] }), // lists: all + backlog (every filter)
      queryClient.invalidateQueries({ queryKey: ["todo"] }), // single todo (details dialog)
      queryClient.invalidateQueries({ queryKey: ["sprints"] }), // sprint list and its numbers
      queryClient.invalidateQueries({ queryKey: ["project"] }), // single project (backlog counter)
      queryClient.invalidateQueries({ queryKey: ["projects"] }), // projects page counters
    ]
  )
}