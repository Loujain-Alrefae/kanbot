import { useAuthStore } from "@/store/auth.store"
import { useQueryClient } from "@tanstack/react-query"

export function useLogout() {
    const queryClient = useQueryClient()
    const clearSession = useAuthStore((s) => s.clearSession)
    return () => {
        clearSession()
        queryClient.clear()
    }
}