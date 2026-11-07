import { useEffect, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import { ErrorState } from "@/components/ErrorState"
import { Spinner } from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import { useLogout } from "../hooks/useLogout"

export function AuthBootstrap({ children }: { children: ReactNode }) {
    const token = useAuthStore((s) => s.token)
    const user = useAuthStore((s) => s.user)
    const setUser = useAuthStore((s) => s.setUser)
    const logout = useLogout()

    // A token is persisted but the user is not: fetch it once (AUTH-3).
    const needsUser = Boolean(token && !user)
    const me = useQuery({
        queryKey: ["auth", "me"],
        queryFn: authApi.me,
        enabled: needsUser,
        retry: false,
    })

    useEffect(() => {
        if (me.data) setUser(me.data.user)
    //throw new Error("test");

    }, [me.data, setUser])

    if (!needsUser) return <>{children}</>

    // A 401 never lands here: the API client clears the session, the token disappears,
    // needsUser becomes false and the route guard sends the user to /login with a toast.
    // Anything else (server down, 5xx) keeps the session and lets the user retry.
    if (me.isError) {
        return (
        <div className="flex min-h-dvh items-center justify-center p-6">
            <div className="w-full max-w-md">
            <ErrorState title="Can't reach Kanbot" message={me.error.message} onRetry={() => me.refetch()}>
                <Button variant="ghost" onClick={logout}>
                Log out
                </Button>
            </ErrorState>
            </div>
        </div>
        )
    }

    return (
        <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
        </div>
    )
}
