"use client"

import { AppSidebar, NavLink } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    FileText,
    Users,
    BarChart3,
    Settings,
} from "lucide-react"
import { useAuth } from "@/hooks/global/use-auth"
import { usePersistedSidebar } from "@/hooks/global/use-persisted-sidebar"

const adminLinks: NavLink[] = [
    { href: "/admin/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/admin/invoices", label: "Invoices", icon: FileText },
    { href: "/admin/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = usePersistedSidebar("finshield_sidebar_admin_collapsed")
    const { user } = useAuth()

    const getPageTitle = (path: string) => {
        if (path === "/admin/admin") return "Admin Dashboard"
        if (path.includes("/invoices")) return "Invoice Management"
        if (path.includes("/employees")) return "Employee Management"
        if (path.includes("/reports")) return "Company Reports"
        if (path.includes("/settings")) return "Settings"
        return "Company Admin"
    }

    const title = getPageTitle(pathname)

    return (
        <div className="flex min-h-screen bg-muted/20 relative">
            <AppSidebar
                links={adminLinks}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                title="FinShield"
            />

            <div
                className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-700 ease-in-out",
                    collapsed ? "ml-0 md:ml-24" : "ml-0 md:ml-72"
                )}
            >
                <div className="sticky top-0 z-40">
                    <TopBar
                        title={title}
                        userName={user?.username}
                        profileLink="/admin/admin/settings"
                        notifications={[
                            { title: "Settings Updated", time: "10m ago", message: "Risk thresholds successfully saved." }
                        ]}
                        onMenuClick={() => setCollapsed(false)}
                    />
                </div>

                <main className="flex-1 p-4 md:p-6 space-y-4">
                    {children}
                </main>
            </div>
        </div>
    )
}
