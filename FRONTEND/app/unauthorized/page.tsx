"use client"

import { useRouter } from "next/navigation"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/global/use-auth"
import { ROLE_HOME, type UserRole } from "@/lib/roles"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const home = user?.role ? ROLE_HOME[user.role as UserRole] || "/" : "/login"
  return (
    <main className="grid min-h-screen place-items-center bg-muted/20 p-6">
      <section className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm" aria-labelledby="unauthorized-title">
        <ShieldX className="mx-auto h-10 w-10 text-red-600" />
        <h1 id="unauthorized-title" className="mt-4 text-2xl font-bold">This portal is not assigned to your role</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account is authenticated, but this route requires a different permission set.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => router.replace(home)}>Go to my dashboard</Button>
          <Button variant="outline" onClick={() => logout()}>Sign out</Button>
        </div>
      </section>
    </main>
  )
}
