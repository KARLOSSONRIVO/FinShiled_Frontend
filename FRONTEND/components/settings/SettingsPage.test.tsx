import { render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

const auth = vi.hoisted(() => ({
    user: {
        username: "finshield-user",
        email: "user@example.com",
        role: "company_employee",
        emailVerified: true,
    },
}))

vi.mock("@/hooks/global/use-auth", () => ({
    useAuth: () => auth,
}))

vi.mock("./MFASettings", () => ({
    MFASettings: () => (
        <section aria-label="Multi-factor authentication">
            Multi-factor authentication settings
        </section>
    ),
}))

vi.mock("./AppearanceSettings", () => ({
    AppearanceSettings: () => <section>Appearance settings</section>,
}))

vi.mock("./ChangePasswordDialog", () => ({
    ChangePasswordDialog: () => null,
}))

vi.mock("framer-motion", () => ({
    motion: {
        div: ({
            children,
            initial: _initial,
            animate: _animate,
            transition: _transition,
            layoutId: _layoutId,
            ...props
        }: ComponentProps<"div"> & {
            initial?: unknown
            animate?: unknown
            transition?: unknown
            layoutId?: string
        }) => <div {...props}>{children}</div>,
    },
}))

import { SettingsPage } from "./SettingsPage"

describe("SettingsPage", () => {
    it("omits the standalone email-verification card and keeps surrounding account controls", () => {
        render(<SettingsPage />)

        expect(screen.getByRole("heading", { name: "Profile Information" })).toBeVisible()
        expect(screen.queryByRole("heading", { name: "Email Verification" })).not.toBeInTheDocument()
        expect(screen.getByLabelText("Multi-factor authentication")).toBeVisible()
        expect(screen.getByRole("heading", { name: "Password Management" })).toBeVisible()
    })
})
