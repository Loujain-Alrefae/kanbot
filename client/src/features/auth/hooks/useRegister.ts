import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import { useAuthStore } from "@/store/auth.store"
import type { RegisterRequest } from "@/types/api"

export function useRegister() {
    const setSession = useAuthStore((s) => s.setSession)
    return useMutation({
        mutationFn: (body: RegisterRequest) => authApi.register(body),
        onSuccess: (res) => setSession(res.token, res.user),
    })
}