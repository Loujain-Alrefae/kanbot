import { api } from "./client"
import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from "@/types/api"

export const authApi = {
    login: (body: LoginRequest) => api.post<AuthResponse>("/auth/login", body),
    register: (body: RegisterRequest) => api.post<AuthResponse>("/auth/register", body),
    me: () => api.get<MeResponse>("/auth/me"),
}