import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import { useAuthStore } from "@/store/auth.store"
import type { LoginRequest } from "@/types/api"

export function useLogin() {
    const setSession = useAuthStore((s) => s.setSession)
    return useMutation({
        mutationFn: (body: LoginRequest) => authApi.login(body),
        onSuccess: (res) => setSession(res.token, res.user),
    })
}