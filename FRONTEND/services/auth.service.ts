import { apiClient } from "@/lib/api-client"

export type MfaMethod = "email" | "authenticator"
export type AuthState = "PASSWORD_CHANGE_REQUIRED" | "MFA_CHALLENGE_REQUIRED" | "LOGIN_REQUIRED" | "AUTHENTICATED"

export interface TemporaryAuthResponse {
    authState: AuthState
    tempToken: string
    enabledMfaMethods: MfaMethod[]
    defaultMfaMethod: MfaMethod
    selectedMethod?: MfaMethod | null
    maskedEmail: string
    emailCodeSent?: boolean
    resendAvailableAt?: string
}

const temporaryHeaders = (tempToken: string) => ({ headers: { "X-Temporary-Auth": tempToken } })
const stepUpHeaders = (stepUpToken: string) => ({ headers: { "X-MFA-Step-Up": stepUpToken } })

export const AuthService = {
    login: async (credentials: { email: string; password: string }) => {
        const { data } = await apiClient.post("/auth/login", credentials)
        return data
    },

    refreshToken: async (refreshToken: string) => {
        const { data } = await apiClient.post("/auth/refresh", { refreshToken })
        return data
    },

    logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) await apiClient.post("/auth/logout", { refreshToken })
    },

    getMe: async () => (await apiClient.get("/auth/me")).data,
    changePassword: async (payload: { currentPassword: string; newPassword: string; confirmPassword?: string }) =>
        (await apiClient.post("/auth/change-password", payload)).data,

    changeTemporaryPassword: async (tempToken: string, payload: { currentPassword: string; newPassword: string }) =>
        (await apiClient.post("/auth/temporary/change-password", payload, temporaryHeaders(tempToken))).data,
    getMfaMethods: async (tempToken: string) =>
        (await apiClient.get("/auth/mfa/methods", temporaryHeaders(tempToken))).data,
    selectMfaMethod: async (tempToken: string, method: MfaMethod) =>
        (await apiClient.post("/auth/mfa/methods/select", { method }, temporaryHeaders(tempToken))).data,
    requestEmailCode: async (tempToken: string) =>
        (await apiClient.post("/auth/mfa/email/request", {}, temporaryHeaders(tempToken))).data,
    verifyMfa: async (tempToken: string, payload: { code: string; method?: MfaMethod }) =>
        (await apiClient.post("/auth/mfa/verify", payload, temporaryHeaders(tempToken))).data,
    cancelMfaSession: async (tempToken: string) =>
        (await apiClient.post("/auth/mfa/session/cancel", {}, temporaryHeaders(tempToken))).data,

    getMfaSettings: async () => (await apiClient.get("/auth/mfa/settings")).data,
    authorizeMfaSetting: async (payload: { password: string; action: "ADD_AUTHENTICATOR" | "REMOVE_AUTHENTICATOR" | "REPLACE_AUTHENTICATOR" | "CHANGE_PREFERRED_METHOD" }) =>
        (await apiClient.post("/auth/mfa/settings/authorize", payload)).data,
    verifyMfaSettingAuthorization: async (tempToken: string, code: string) =>
        (await apiClient.post("/auth/mfa/settings/authorize/verify", { code }, temporaryHeaders(tempToken))).data,
    startAuthenticatorSetup: async (stepUpToken: string) =>
        (await apiClient.post("/auth/mfa/authenticator/setup", {}, stepUpHeaders(stepUpToken))).data,
    completeAuthenticatorSetup: async (stepUpToken: string, code: string) =>
        (await apiClient.post("/auth/mfa/authenticator/verify", { code }, stepUpHeaders(stepUpToken))).data,
    removeAuthenticator: async (stepUpToken: string) =>
        (await apiClient.delete("/auth/mfa/authenticator", stepUpHeaders(stepUpToken))).data,
    changePreferredMfaMethod: async (stepUpToken: string, method: MfaMethod) =>
        (await apiClient.put("/auth/mfa/default-method", { method }, stepUpHeaders(stepUpToken))).data,
}
