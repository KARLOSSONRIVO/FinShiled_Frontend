"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { useAuth } from "@/hooks/global/use-auth"
import type { UserRole } from "@/lib/roles"

export function RoleGuard({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const allowed = !!user && allowedRoles.includes(user.role as UserRole)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.replace("/login")
    else if (user?.mustChangePassword) router.replace("/change-temporary-password")
    else if (!allowed) router.replace("/unauthorized")
  }, [allowed, isAuthenticated, isLoading, router, user?.mustChangePassword])

  if (isLoading || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/20" role="status" aria-label="Checking access">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ShieldAlert className="h-5 w-5 animate-pulse text-emerald-600" />
          Verifying portal access
        </div>
      </div>
    )
  }
  return children
}
