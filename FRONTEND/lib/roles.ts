export const USER_ROLES = {
  OWNER: "OWNER",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  COMPANY_MANAGER: "COMPANY_MANAGER",
  COMPANY_USER: "COMPANY_USER",
  AUDITOR: "AUDITOR",
  REGULATOR: "REGULATOR",
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  SYSTEM_ADMIN: "System Administrator",
  COMPANY_MANAGER: "Company Manager",
  COMPANY_USER: "Company User",
  AUDITOR: "Auditor",
  REGULATOR: "Regulator",
}

export const ROLE_HOME: Record<UserRole, string> = {
  OWNER: "/admin/owner",
  SYSTEM_ADMIN: "/admin/system-administrator",
  COMPANY_MANAGER: "/company/manager",
  COMPANY_USER: "/company/employee",
  AUDITOR: "/admin/external-auditor",
  REGULATOR: "/admin/regulator",
}
