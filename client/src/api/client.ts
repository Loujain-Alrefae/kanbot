import axios, { type AxiosResponse } from "axios"
import { useAuthStore } from "@/store/auth.store"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"

/* The only thing we keep on the client: the JWT (NFR-7). Never log it. */
export const tokenStore = {
  get: () => useAuthStore.getState().token,
  set: (token: string) => useAuthStore.setState({ token }),
  clear: () => useAuthStore.getState().clearSession(),
}

export interface FieldDetail {
  path: string
  message: string
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: FieldDetail[] }
}

export class ApiError extends Error {
  status: number
  code: string
  details: FieldDetail[]

  constructor(status: number, code: string, message: string, details: FieldDetail[] = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

/* AuthProvider registers this so a 401 anywhere logs the user out (AUTH-6). */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

/*
 * validateStatus always returns true so Axios never throws on HTTP status codes:
 * we keep the exact same status handling as before (ApiError, 401 handler).
 * Only real network failures and cancellations are thrown by Axios.
 */
const http = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
})

/* Same tolerance as before: a body that is not valid JSON becomes null. */
function parseJsonOrNull(raw: unknown): unknown {
  if (typeof raw !== "string") return raw
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: AxiosResponse<unknown>
  try {
    res = await http.request<unknown>({
      url: path,
      method: options.method ?? "GET",
      headers,
      data: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      transformResponse: [parseJsonOrNull],
    })
  } catch (e) {
    if (axios.isCancel(e)) throw e
    throw new ApiError(0, "NETWORK_ERROR", "Cannot reach the server. Is it running?")
  }

  if (res.status === 204) return undefined as T

  const data: unknown = res.data

if (res.status < 200 || res.status >= 300) {
    const err = (data as ErrorBody | null)?.error
    const apiError = new ApiError(
        res.status,
        err?.code ?? "UNKNOWN",
        err?.message ?? "Something went wrong. Please try again.",
        err?.details ?? [],
    )
    // A 401 on login just means wrong credentials, not an expired session.
    if (res.status === 401 && path !== "/auth/login") {
    useAuthStore.getState().clearSession()
    onUnauthorized?.()
}
    throw apiError
  }

  return data as T
}

export const api = {
    get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}

/* Turns server `details[]` into { fieldName: message } so forms can call setError. */
export function fieldErrors(err: unknown): Record<string, string> {
    if (!(err instanceof ApiError)) return {}
    return Object.fromEntries(err.details.map((d) => [d.path, d.message]))
}