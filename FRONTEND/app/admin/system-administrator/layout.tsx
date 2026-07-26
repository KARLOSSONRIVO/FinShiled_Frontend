"use client"

import { usePathname } from "next/navigation"
import { Activity, Blocks, ClipboardList, Gauge, KeyRound, ShieldAlert, SlidersHorizontal, UserCog } from "lucide-react"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { AppSidebar, type NavLink } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { usePersistedSidebar } from "@/hooks/global/use-persisted-sidebar"
import { cn } from "@/lib/utils"

const links: NavLink[] = [
  { href: "/admin/system-administrator", label: "System Dashboard", icon: Gauge },
  { href: "/admin/system-administrator/system-administrators", label: "System Administrators", icon: UserCog },
  { href: "/admin/system-administrator/access-control", label: "Technical Access Control", icon: KeyRound },
  { href: "/admin/system-administrator/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/admin/system-administrator/system-status", label: "System Status", icon: Activity },
  { href: "/admin/system-administrator/blockchain", label: "Blockchain Transactions", icon: Blocks },
  { href: "/admin/system-administrator/security-monitoring", label: "Security Monitoring", icon: ShieldAlert },
  { href: "/admin/system-administrator/platform-configuration", label: "Platform Configuration", icon: SlidersHorizontal },
]

export default function SystemAdministratorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = usePersistedSidebar("finshield_sidebar_system_administrator_collapsed")
  const current = links.find((link) => pathname === link.href || (link.href !== "/admin/system-administrator" && pathname.startsWith(link.href)))
  return <RoleGuard allowedRoles={["SYSTEM_ADMIN"]}><div className="flex min-h-screen bg-muted/20"><AppSidebar links={links} collapsed={collapsed} setCollapsed={setCollapsed} title="FinShield Systems" showSignOut={false} /><div className={cn("flex min-w-0 flex-1 flex-col transition-all duration-700", collapsed ? "ml-0 md:ml-24" : "ml-0 md:ml-72")}><div className="sticky top-0 z-40"><TopBar title={current?.label || "System Dashboard"} profileLink="/admin/system-administrator/settings" onMenuClick={() => setCollapsed(false)} /></div><main className="flex-1 space-y-6 p-4 md:p-6">{children}</main></div></div></RoleGuard>
}
