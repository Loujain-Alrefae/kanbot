    interface StatTileProps {
    label: string
    value: string
    }

    /* Must be rendered inside a <dl>. */
    export function StatTile({ label, value }: StatTileProps) {
    return (
        <div className="rounded-lg border bg-muted p-4">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
        </div>
    )
}