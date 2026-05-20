"use client"

import { useState, useEffect } from "react"
import { AppSidebar, NavLink } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    FileText,
    AlertTriangle,
    Link2,
    FileBarChart,
} from "lucide-react"
import { useAuth } from "@/hooks/global/use-auth"
 
const auditorLinks: NavLink[] = [
    { href: "/admin/auditor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/auditor/invoices", label: "All Invoices", icon: FileText },
    { href: "/admin/auditor/flagged", label: "Flagged Queue", icon: AlertTriangle },
    { href: "/admin/auditor/pending", label: "Pending Queue", icon: AlertTriangle },
    { href: "/admin/auditor/reports", label: "Reports", icon: FileBarChart },
    { href: "/admin/auditor/blockchain", label: "Blockchain Ledger", icon: Link2 },
]
 
export default function AuditorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(true)
    const { user } = useAuth()
 
    useEffect(() => {
        if (window.innerWidth >= 768) {
            setCollapsed(false)
        }
    }, [])

    // Determine title based on path
    const getPageTitle = (path: string) => {
        if (path === "/admin/auditor") return "Auditor Dashboard"
        if (path.includes("/invoices")) return "Invoice Auditing"
        if (path.includes("/flagged")) return "Flagged Queue"
        if (path.includes("/pending")) return "Pending Queue"
        if (path.includes("/reports")) return "Reports"
        if (path.includes("/blockchain")) return "Blockchain Ledger"
        if (path.includes("/settings")) return "Profile Management"
        return "FinShield Auditor"
    }

    const title = getPageTitle(pathname)

    return (
        <div className="flex min-h-screen bg-muted/20 relative">
            {/* Sidebar with fixed positioning */}
            <AppSidebar
                links={auditorLinks}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                title="FinShield"
            />

            {/* Main content wrapper */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-700 ease-in-out",
                    collapsed ? "ml-0 md:ml-24" : "ml-0 md:ml-72"
                )}
            >
                {/* Top Navigation Bar - Sticky */}
                <div className="sticky top-0 z-40">
                    <TopBar
                        title={title}
                        userName={user?.username}
                        profileLink="/admin/auditor/settings"
                        notifications={[
                            { title: "New Assignment", time: "1h ago", message: "You have been assigned to review Company 100." },
                            { title: "New Assignment", time: "2h ago", message: "You have been assigned to review Company 101." }
                        ]}
                        onMenuClick={() => setCollapsed(false)}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 w-full max-w-[100vw] p-4 md:p-6 space-y-4">
                    {children}
                </main>
            </div>
        </div>
    )
}
