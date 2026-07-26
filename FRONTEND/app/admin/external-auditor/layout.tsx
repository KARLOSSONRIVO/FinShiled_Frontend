"use client"

import { useState, useEffect } from "react"
import { AppSidebar, NavLink } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    FileText,
    Upload,
    AlertTriangle,
    Link2,
    FileBarChart,
} from "lucide-react"
import { useAuth } from "@/hooks/global/use-auth"
import { usePersistedSidebar } from "@/hooks/global/use-persisted-sidebar"

const auditorLinks: NavLink[] = [
    { href: "/admin/external-auditor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/external-auditor/upload", label: "Upload Invoice", icon: Upload },
    { href: "/admin/external-auditor/invoices", label: "All Invoices", icon: FileText },
    { href: "/admin/external-auditor/flagged", label: "Flagged Queue", icon: AlertTriangle },
    { href: "/admin/external-auditor/pending", label: "Pending Queue", icon: AlertTriangle },
    { href: "/admin/external-auditor/reports", label: "Reports", icon: FileBarChart },
    { href: "/admin/external-auditor/blockchain", label: "Blockchain Transactions", icon: Link2 },
]
 
export default function AuditorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = usePersistedSidebar("finshield_sidebar_auditor_collapsed")
    const { user } = useAuth()

    // Determine title based on path
    const getPageTitle = (path: string) => {
        if (path === "/admin/external-auditor") return "External Auditor Dashboard"
        if (path.includes("/upload")) return "Upload Invoice"
        if (path.includes("/invoices")) return "Invoice Auditing"
        if (path.includes("/flagged")) return "Flagged Queue"
        if (path.includes("/pending")) return "Pending Queue"
        if (path.includes("/reports")) return "Reports"
        if (path.includes("/blockchain")) return "Blockchain Transactions"
        if (path.includes("/settings")) return "Profile Management"
        return "FinShield External Auditor"
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
                        profileLink="/admin/external-auditor/settings"
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
