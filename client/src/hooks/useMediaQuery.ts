import { useCallback, useSyncExternalStore } from "react"

/* true while the media query matches, and it re-renders when that changes (for example when the window is resized). */
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (onChange: () => void) => {
        const media = window.matchMedia(query)
        media.addEventListener("change", onChange)
        return () => media.removeEventListener("change", onChange)
        },
        [query],
    )

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false,
    )
}