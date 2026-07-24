"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/services/auth.service"
import type { components } from "@/lib/api-types"

type User = components["schemas"]["User"] & {
    emailVerified?: boolean
    mfaEnabled?: boolean
    defaultMfaMethod?: "email" | "authenticator"
    enabledMfaMethods?: Array<"email" | "authenticator">
    mfaActivatedAt?: string | null
    totpEnabled?: boolean
}
type LoginRequest = Parameters<typeof AuthService.login>[0]

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginRequest) => Promise<any>
    logout: () => Promise<void>
    clearSession: () => void
    refreshUser: () => Promise<void>
    completeMfaAuthentication: (response: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Initialize auth state — validates token against API, not just localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                setIsLoading(false)
                return
            }
            try {
                // Validate the stored token — race against a 5s timeout so a
                // slow/offline backend never keeps isLoading=true indefinitely.
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Auth init timed out")), 5000)
                )
                const response = await Promise.race([AuthService.getMe(), timeoutPromise]) as any
                const userData = response?.data?.user || response?.data || response?.user
                if (userData) {
                    setUser(userData)
                    localStorage.setItem("user", JSON.stringify(userData))
                } else {
                    throw new Error("Invalid user data from /auth/me")
                }
            } catch (error) {
                // Token is expired, invalid, or backend timed out — clear session
                localStorage.removeItem("token")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const handleAuthSuccess = (data: any) => {
        const userData = data?.user || (data?.data && data.data.user)
        const accessToken = data?.accessToken || (data?.data && data.data.accessToken)
        const refreshToken = data?.refreshToken || (data?.data && data.data.refreshToken)

        if (accessToken && userData) {
            localStorage.setItem("token", accessToken)
            localStorage.setItem("user", JSON.stringify(userData))
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken)
            }
            sessionStorage.removeItem("finshield_temp_auth")

            // Set cookie for middleware
            document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Strict`

            setUser(userData)
            navigateBasedOnRole(userData)
        } else {
            throw new Error("Invalid response structure from server")
        }
    }

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true)
        try {
            const response: any = await AuthService.login(credentials)
            const temporary = response.data || response
            if (temporary?.authState && temporary?.tempToken) {
                sessionStorage.setItem("finshield_temp_auth", JSON.stringify(temporary))
                if (temporary.authState === "PASSWORD_CHANGE_REQUIRED") {
                    router.replace("/change-temporary-password")
                } else {
                    router.replace("/mfa")
                }
                return temporary
            }

            const success = response.success || response.ok || (response.data && (response.data.accessToken || response.data.user))

            if (success) {
                handleAuthSuccess(response)
                return { success: true }
            } else {
                throw new Error("Login failed")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const completeMfaAuthentication = (response: any) => handleAuthSuccess(response)

    const clearSession = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        sessionStorage.removeItem('finshield_temp_auth')

        if (typeof window !== 'undefined') {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i)
                if (key && (key.startsWith('finshield_') || key.startsWith('FINSHIELD_'))) {
                    localStorage.removeItem(key)
                }
            }
        }

        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        setUser(null)
    }

    const logout = async () => {
        try {
            await AuthService.logout()
        } catch (error: any) {
            // Silently fail logout if token is already bad, user is being redirected anyway
        } finally {
            clearSession()
            router.push('/login')
        }
    }

    const refreshUser = async () => {
        try {
            const response = await AuthService.getMe() as any
            const userData = response?.data?.user || response?.data || response?.user
            if (userData) {
                setUser(userData)
                localStorage.setItem("user", JSON.stringify(userData))
            }
        } catch {
            // ignore refresh errors
        }
    }

    const navigateBasedOnRole = (user: User) => {
        if ((user as any).mustChangePassword) {
            router.replace('/change-temporary-password')
            return
        }

        switch (user.role as string) {
            case "SUPER_ADMIN":
                router.push("/admin/superadmin")
                break
            case "ADMINISTRATOR":
            case "ADMIN":
                router.push("/admin/admin")
                break
            case "AUDITOR":
                router.push("/admin/external-auditor")
                break
            case "REGULATOR":
                router.push("/admin/regulator")
                break
            case "COMPANY_MANAGER":
                router.push("/company/manager")
                break
            case "COMPANY_USER":
                router.push("/company/employee")
                break
            default:
                router.push("/")
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            clearSession,
            refreshUser,
            completeMfaAuthentication
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider")
    }
    return context
}
