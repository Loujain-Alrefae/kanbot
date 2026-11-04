import { useState } from "react"

    /*
    * A temporary local copy of server data, used only WHILE the user drags something (and for the instant after
    * the drop). `base` is the cached data the copy was made from.
    *
    * Why not just wait for the cache? The optimistic update needs a moment (the mutation cancels running fetches
    * first), and a dropped card would flash back to its old place meanwhile. The copy bridges that gap.
    *
    * It removes itself by identity: the moment the cache holds a different object than `base` (the optimistic
    * update, a refetch, or a rollback), the copy is obsolete and is dropped. So it can never come back to life
    * after a rollback restores the old data.
    */
    export function useDraft<T>(base: T) {
    const [draft, setDraftState] = useState<{ base: T; value: T } | null>(null)

    // "Adjusting state while rendering": React allows it, re-renders at once, and it cannot loop
    // (after the reset the condition is false).
    if (draft !== null && draft.base !== base) setDraftState(null)

    return {
        /** What to render: the copy while it is still valid, otherwise the real data. */
        shown: draft !== null && draft.base === base ? draft.value : base,
        setDraft: (value: T) => setDraftState({ base, value }),
        clearDraft: () => setDraftState(null),
    }
    }