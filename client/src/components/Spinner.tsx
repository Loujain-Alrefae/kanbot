export function Spinner({ className = "size-8" }: { className?: string }) {
    return (
        <div
        role="status"
        aria-label="Loading"
        className={`${className} animate-spin rounded-full border-2 border-muted border-t-primary`}
        />
    )
}