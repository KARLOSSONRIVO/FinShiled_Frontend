import { beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"

vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
})
Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: vi.fn(() => null),
})

const mocks = vi.hoisted(() => {
    const replace = vi.fn()
    return {
    replace,
    router: { replace },
    complete: vi.fn(),
    clear: vi.fn(),
    selectMethod: vi.fn(),
    requestEmail: vi.fn(),
    verify: vi.fn(),
    cancel: vi.fn(),
}})

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("next/image", () => ({ default: ({ priority: _priority, ...props }: any) => <img {...props} /> }))
vi.mock("@/providers/auth-provider", () => ({
    useAuthContext: () => ({ completeMfaAuthentication: mocks.complete, clearSession: mocks.clear }),
}))
vi.mock("@/services/auth.service", () => ({
    AuthService: {
        selectMfaMethod: mocks.selectMethod,
        requestEmailCode: mocks.requestEmail,
        verifyMfa: mocks.verify,
        cancelMfaSession: mocks.cancel,
    },
}))

import MfaPage from "./page"

function store(overrides: Record<string, unknown> = {}) {
    sessionStorage.setItem("finshield_temp_auth", JSON.stringify({
        authState: "MFA_CHALLENGE_REQUIRED",
        tempToken: "temporary-token",
        enabledMfaMethods: ["email"],
        defaultMfaMethod: "email",
        selectedMethod: null,
        maskedEmail: "p*****@example.com",
        emailCodeSent: false,
        ...overrides,
    }))
}

describe("mandatory MFA method selection", () => {
    beforeEach(() => {
        sessionStorage.clear()
        vi.clearAllMocks()
        mocks.selectMethod.mockResolvedValue({ data: {} })
        mocks.cancel.mockResolvedValue({})
    })

    it("shows email as the primary action and hides unenrolled authenticator", async () => {
        store()
        render(<MfaPage />)
        expect(await screen.findByRole("button", { name: "Verify through email" })).toBeVisible()
        expect(screen.queryByRole("button", { name: "Authenticator application" })).not.toBeInTheDocument()
    })

    it("shows a blocking sending modal until the email request finishes", async () => {
        store()
        let finishRequest!: (value: { data: { resendAvailableAt: string } }) => void
        mocks.selectMethod.mockReturnValueOnce(new Promise((resolve) => {
            finishRequest = resolve
        }))
        render(<MfaPage />)

        fireEvent.click(await screen.findByRole("button", { name: "Verify through email" }))

        expect(await screen.findByRole("dialog", { name: /Sending verification email/i })).toBeVisible()

        await act(async () => {
            finishRequest({
                data: { resendAvailableAt: new Date(Date.now() + 60_000).toISOString() },
            })
        })

        await waitFor(() => expect(screen.queryByRole("dialog", { name: /Sending verification email/i })).not.toBeInTheDocument())
    })

    it("renders all six OTP slots after email verification is selected", async () => {
        store()
        const { container } = render(<MfaPage />)

        fireEvent.click(await screen.findByRole("button", { name: "Verify through email" }))

        await waitFor(() => expect(mocks.selectMethod).toHaveBeenCalledWith("temporary-token", "email"))
        expect(await screen.findByRole("heading", { name: "Check your email" })).toBeVisible()
        expect(container.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(6)
    })

    it("shows authenticator only under More options after enrollment", async () => {
        store({ enabledMfaMethods: ["email", "authenticator"] })
        render(<MfaPage />)
        fireEvent.click(await screen.findByRole("button", { name: /More options/i }))
        expect(screen.getByRole("button", { name: "Authenticator application" })).toBeVisible()
    })

    it("uses authenticator as the main option when it is preferred and keeps email as fallback", async () => {
        store({
            defaultMfaMethod: "authenticator",
            selectedMethod: null,
            enabledMfaMethods: ["email", "authenticator"],
            emailCodeSent: false,
        })
        render(<MfaPage />)
        expect(await screen.findByRole("button", { name: "Use authenticator application" })).toBeVisible()
        fireEvent.click(screen.getByRole("button", { name: /More options/i }))
        expect(screen.getByRole("button", { name: "Verify through email" })).toBeVisible()
    })

    it("rejects the removed activation state and never renders activation controls", async () => {
        store({ authState: "MFA_SETUP_REQUIRED" })
        render(<MfaPage />)
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"))
        expect(sessionStorage.getItem("finshield_temp_auth")).toBeNull()
        expect(screen.queryByText("Activate account protection")).not.toBeInTheDocument()
    })
})
