import { describe, expect, it } from "vitest"
import { ROLE_HOME, ROLE_LABELS, USER_ROLES } from "./roles"

describe("administrative role routing", () => {
  it("redirects Owner and System Administrator to separate dashboards", () => {
    expect(ROLE_HOME[USER_ROLES.OWNER]).toBe("/admin/owner")
    expect(ROLE_HOME[USER_ROLES.SYSTEM_ADMIN]).toBe("/admin/system-administrator")
    expect(ROLE_HOME[USER_ROLES.OWNER]).not.toBe(ROLE_HOME[USER_ROLES.SYSTEM_ADMIN])
  })

  it("uses the required user-facing role labels", () => {
    expect(ROLE_LABELS).toMatchObject({
      OWNER: "Owner",
      SYSTEM_ADMIN: "System Administrator",
      COMPANY_MANAGER: "Company Manager",
      COMPANY_USER: "Company User",
      AUDITOR: "Auditor",
      REGULATOR: "Regulator",
    })
  })
})
