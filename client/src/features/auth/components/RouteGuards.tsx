import { Navigate, Outlet, useLocation } from "react-router"
import { useAuthStore } from "@/store/auth.store"

/* Signed-out users go to /login and return to where they were after logging in  */
export function ProtectedRoute() {
    const token = useAuthStore((s) => s.token)
    const location = useLocation()

    if (!token) {
        const redirect = encodeURIComponent(location.pathname + location.search)
        return <Navigate to={`/login?redirect=${redirect}`} replace />
    }
    return <Outlet />
}

/* Signed-in users never see /login or /register  */
export function GuestRoute() {
    const token = useAuthStore((s) => s.token)

    if (token) return <Navigate to="/projects" replace />
    return <Outlet />
}