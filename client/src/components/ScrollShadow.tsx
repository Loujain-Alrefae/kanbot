import { useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollShadowProps {
    children: ReactNode
    /** Classes of the scrolling area itself (padding goes here). */
    className?: string
}


export function ScrollShadow({ children, className }: ScrollShadowProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [hasMore, setHasMore] = useState(false)

    const update = useCallback(() => {
        const element = ref.current
        if (!element) return
        setHasMore(element.scrollHeight - element.scrollTop - element.clientHeight > 1)
    }, [])

    useEffect(() => {
        const element = ref.current
        if (!element) return
        update()
        const observer = new ResizeObserver(update)
        observer.observe(element)
        if (element.firstElementChild) observer.observe(element.firstElementChild)
        return () => observer.disconnect()
    }, [update])

    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={ref} onScroll={update} className={cn("min-h-0 flex-1 overflow-y-auto", className)}>
            {children}
        </div>
        <div
            aria-hidden="true"
            className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-10 transition-opacity duration-150 motion-reduce:transition-none",
            hasMore ? "opacity-100" : "opacity-0",
            )}
            style={{ background: "linear-gradient(to top, var(--scroll-shadow), transparent)" }}
        />
        </div>
    )
}