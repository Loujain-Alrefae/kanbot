import { Link, Outlet, useParams } from "react-router"
import { ApiError } from "@/api/client"
import { ErrorState } from "@/components/ErrorState"
import { Spinner } from "@/components/Spinner"
import { useProject } from "@/hooks/useProjects"

/* Wraps every /projects/:projectId/* page: the project is loaded once and
    an unknown or foreign id shows an error instead of an empty page. 
*/
export function ProjectRoute() {
    const { projectId } = useParams()
    const { isPending, isError, error, refetch } = useProject(projectId)

    if (isPending) {
        return (
        <div className="flex h-64 items-center justify-center">
            <Spinner />
        </div>
        )
    }

    if (isError) {
        // The API answers 404 for ids that don't exist or belong to someone else.
        const notFound = error instanceof ApiError && error.status === 404
        return (
        <div className="p-6">
            <ErrorState
            title={notFound ? "Project not found" : "We couldn't load this project"}
            message={
                notFound ? "This project doesn't exist, or you don't have access to it." : error.message
            }
            onRetry={notFound ? undefined : () => refetch()}
            >
            <Link to="/projects" className="text-sm font-medium underline underline-offset-4">
                Back to all projects
            </Link>
            </ErrorState>
        </div>
        )
    }

    return <Outlet />
}