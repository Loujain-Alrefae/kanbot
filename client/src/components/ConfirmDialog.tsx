import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    loading?: boolean
    onConfirm: () => void
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Delete",
    loading = false,
    onConfirm,
    }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                {loading ? "Deleting…" : confirmLabel}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}