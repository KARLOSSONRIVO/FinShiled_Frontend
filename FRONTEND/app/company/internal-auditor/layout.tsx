"use client"

import { AppSidebar, NavLink } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ScrollText,
    BarChart3,
    Settings2,
} from "lucide-react"
import { useAuth } from "@/hooks/global/use-auth"
import { usePersistedSidebar } from "@/hooks/global/use-persisted-sidebar"

const internalAuditorLinks: NavLink[] = [
    { href: "/company/internal-auditor", label: "Verification Queue", icon: LayoutDashboard },
    { href: "/company/internal-auditor/review-history", label: "Review History", icon: ScrollText },
    { href: "/company/internal-auditor/reports", label: "Reports", icon: BarChart3 },
    { href: "/company/internal-auditor/settings", label: "Settings", icon: Settings2 },
]

export default function InternalAuditorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = usePersistedSidebar("finshield_sidebar_internal_auditor_collapsed")
    const { user } = useAuth()

    const getPageTitle = (path: string) => {
        if (path === "/company/internal-auditor") return "Verification Queue"
        if (path.includes("/verification")) return "Invoice Inspector"
        if (path.includes("/review-history")) return "Review History"
        if (path.includes("/reports")) return "Auditor Reports"
        if (path.includes("/settings")) return "Settings"
        return "Internal Auditor Workspace"
    }

    const title = getPageTitle(pathname)

    return (
        <div className="flex min-h-screen bg-muted/20 relative">
            <AppSidebar
                links={internalAuditorLinks}
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
                        profileLink="/company/internal-auditor/settings"
                        notifications={[
                            { title: "Pending Review", time: "5m ago", message: "New flagged invoice requires verification." }
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
