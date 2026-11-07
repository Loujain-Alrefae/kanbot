import { useEffect } from "react"
import { useRouteError } from "react-router"
import { ErrorScreen } from "./ErrorScreen"

/* errorElement of the root route: React Router catches render errors of pages itself and shows this. */
export function RouteErrorPage() {
    const error = useRouteError()

    useEffect(() => {
        console.error("Route error:", error) // development only: nothing is shown in the UI
    }, [error])

    return <ErrorScreen />
}