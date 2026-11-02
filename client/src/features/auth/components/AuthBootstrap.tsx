import { useEffect, useState, type ReactNode } from "react"
import { authApi } from "@/api/auth"
import { useAuthStore } from "@/store/auth.store"
import { Spinner } from "@/components/Spinner"

export function AuthBootstrap({ children }: { children: ReactNode }) {
    const token = useAuthStore((s) => s.token)
    const user = useAuthStore((s) => s.user)
    const [loading, setLoading] = useState(Boolean(token && !user))

    useEffect(() => {
        if (!token || user) {
            setLoading(false)
            return
        }
        let cancelled = false
        authApi.me().then((res) => {
            if (!cancelled) useAuthStore.getState().setUser(res.user)
        })
        .catch(() => {
            // 401 is already handled by the API client; any other failure also ends the session.
            useAuthStore.getState().clearSession()
        })
        .finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => {
        cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on app start
    }, [])

    if (loading) {
        return (
        <div className="flex min-h-screen items-center justify-center">
            <Spinner />
        </div>
        )
    }
    return <>{children}</>
}