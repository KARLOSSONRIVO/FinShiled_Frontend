
import { useAuthContext } from "@/providers/auth-provider"

export const useAuth = () => {
    const context = useAuthContext()

    return {
        ...context,
        isOwner: context.user?.role === "OWNER",
        isSystemAdmin: context.user?.role === "SYSTEM_ADMIN",
        isAuditor: context.user?.role === "AUDITOR",
        isRegulator: context.user?.role === "REGULATOR",
        isCompanyManager: context.user?.role === "COMPANY_MANAGER",
        isCompanyUser: context.user?.role === "COMPANY_USER",
        isAdmin: ["OWNER", "SYSTEM_ADMIN", "AUDITOR", "REGULATOR"].includes(context.user?.role || "")
    }
}
