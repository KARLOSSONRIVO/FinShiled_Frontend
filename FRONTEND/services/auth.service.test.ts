import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() }))
vi.mock("@/lib/api-client", () => ({ apiClient: { get: mocks.get, post: mocks.post, put: mocks.put, delete: mocks.del } }))

import { AuthService } from "./auth.service"

describe("AuthService mandatory MFA", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        for (const fn of Object.values(mocks)) fn.mockResolvedValue({ data: { ok: true, data: {} } })
    })

    it("sends temporary auth in a dedicated header, never as a normal bearer token", async () => {
        await AuthService.verifyMfa("temporary-token", { code: "123456", method: "email" })
        expect(mocks.post).toHaveBeenCalledWith(
            "/auth/mfa/verify",
            { code: "123456", method: "email" },
            { headers: { "X-Temporary-Auth": "temporary-token" } },
        )
    })

    it("requires a step-up header for authenticator removal", async () => {
        await AuthService.removeAuthenticator("step-up-token")
        expect(mocks.del).toHaveBeenCalledWith(
            "/auth/mfa/authenticator",
            { headers: { "X-MFA-Step-Up": "step-up-token" } },
        )
    })
})
