import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const SHORTCUTS = [
    { keys: "c", action: "Create a todo", where: "Backlog" },
    { keys: "/", action: "Search", where: "Backlog" },
    { keys: "?", action: "Show this list", where: "Everywhere" },
] as const

interface ShortcutsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
            <DialogHeader className="border-b px-6 py-4 pr-12 text-left">
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
                They work when you are not typing in a field. Everything here can also be done with the mouse.
            </DialogDescription>
            </DialogHeader>

            <ul className="divide-y px-6">
            {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.keys} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                    <p className="font-medium">{shortcut.action}</p>
                    <p className="text-xs text-muted-foreground">{shortcut.where}</p>
                </div>
                <kbd className="inline-flex min-w-7 items-center justify-center rounded-md border bg-muted px-2 py-1 font-mono text-xs font-medium">
                    {shortcut.keys}
                </kbd>
                </li>
            ))}
            </ul>

            <div className="flex justify-end border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    )
}