import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Project } from "@/types/api"
import { ProjectForm } from "./projectForm"

interface ProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Present = edit mode, absent = create mode. */
    project?: Project
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>
                {project ? "Update the details of this project." : "Projects group your backlog and sprints."}
            </DialogDescription>
            </DialogHeader>
            {/* key remounts the form, so values reset every time the dialog opens for a different project */}
            <ProjectForm key={project?.id ?? "new"} project={project} onDone={() => onOpenChange(false)} />
        </DialogContent>
        </Dialog>
    )
}