import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}))

vi.mock("sonner", () => ({
  Toaster: ({ duration }: { duration?: number }) => (
    <div data-testid="sonner-toaster" data-duration={duration} />
  ),
}))

import { Toaster } from "./sonner"

describe("global toast timing", () => {
  it("dismisses success and error notifications after 1.5 seconds", () => {
    render(<Toaster />)

    expect(screen.getByTestId("sonner-toaster")).toHaveAttribute(
      "data-duration",
      "1500",
    )
  })
})
