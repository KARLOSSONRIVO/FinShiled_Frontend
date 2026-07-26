"use client"

import { AppSidebar, NavLink } from "@/components/layout/AppSidebar"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { TopBar } from "@/components/layout/TopBar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    UserPlus,
    Shield,
    UserRound,
} from "lucide-react"
import { usePersistedSidebar } from "@/hooks/global/use-persisted-sidebar"
 
const ownerLinks: NavLink[] = [
    { href: "/admin/owner", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/owner/organizations", label: "Organizations", icon: Building2 },
    { href: "/admin/owner/users", label: "Users", icon: Users },
    { href: "/admin/owner/assignments", label: "Access Control", icon: UserPlus },
    { href: "/admin/owner/invoices", label: "Invoices", icon: FileText },
    { href: "/admin/owner/business-settings", label: "Business Settings", icon: Shield },
    { href: "/admin/owner/settings", label: "Profile", icon: UserRound },
]
 
export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = usePersistedSidebar("finshield_sidebar_owner_collapsed")

    // Determine title based on path
    const getPageTitle = (path: string) => {
        if (path === "/admin/owner") return "Dashboard"
        if (path.includes("/organizations")) return "Organization Management"
        if (path.includes("/users")) return "User Management"
        if (path.includes("/assignments")) return "Access Control"
        if (path.includes("/invoices")) return "Invoices"
        if (path.includes("/flagged")) return "Flagged Queue"
        if (path.includes("/reports")) return "Platform Reports"
        if (path.includes("/business-settings")) return "Business Settings"
        if (path.includes("/policy")) return "Policy Management"
        if (path.includes("/terms")) return "Terms Management"
        if (path.includes("/settings")) return "Profile"
        return "Owner Dashboard"
    }

    const title = getPageTitle(pathname)

    return (
        <RoleGuard allowedRoles={["OWNER"]}>
        <div className="flex min-h-screen bg-muted/20 relative">
            {/* Sidebar with fixed positioning */}
            <AppSidebar
                links={ownerLinks}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                title="FinShield"
            />

            {/* Main content wrapper */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-w-0 w-full transition-all duration-700 ease-in-out",
                    collapsed ? "ml-0 md:ml-24" : "ml-0 md:ml-72"
                )}
            >
                {/* Top Navigation Bar - Sticky */}
                <div className="sticky top-0 z-40">
                    <TopBar
                        title={title}
                        profileLink="/admin/owner/settings"
                        notifications={[
                            { title: "New Fraud Alert", time: "2m ago", message: "Invoice INV-2024-100 tagged for review." },
                            { title: "New Fraud Alert", time: "5m ago", message: "Invoice INV-2024-101 tagged for review." }
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
        </RoleGuard>
    )
}
