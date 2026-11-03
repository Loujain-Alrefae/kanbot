import { useEffect, useState } from "react"

/* Returns `value` only after it has stopped changing for `delay` ms (search box, NFR-6). */
export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}