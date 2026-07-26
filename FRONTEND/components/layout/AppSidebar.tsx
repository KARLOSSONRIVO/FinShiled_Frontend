"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    AlertTriangle,
    Link2,
    ScrollText,
    LogOut,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Shield,
    LucideIcon
} from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/global/use-auth"

export interface NavLink {
    href: string
    label: string
    icon: LucideIcon
}

interface AppSidebarProps {
    links: NavLink[]
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
    title?: string
    showSignOut?: boolean
}

export function AppSidebar({ links, collapsed, setCollapsed, title = "FinShield", showSignOut = true }: AppSidebarProps) {
    const pathname = usePathname()
    const { logout } = useAuth()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
 
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    return (
        <>
            {/* Desktop Collapsible Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col h-screen fixed inset-y-0 left-0 z-[30] bg-sidebar border-r border-border transition-all duration-700 ease-in-out text-sidebar-foreground shadow-sm overflow-hidden",
                    collapsed ? "w-24" : "w-72",
                )}
            >
                {/* Header / Logo Area */}
                <div className="h-20 flex shrink-0 items-center pl-[20px] pr-4 border-b border-border relative">
                    <div className={cn(
                        "flex items-center transition-opacity duration-700 ease-in-out",
                        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}>
                        <img
                            src="/assets/image/FinShield.svg"
                            alt="FinShield Logo"
                            className="h-9 w-auto object-contain"
                        />
                        <div className="overflow-hidden whitespace-nowrap ml-3">
                            <span className="font-bold text-xl tracking-tight text-sidebar-foreground truncate">{title}</span>
                        </div>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 shrink-0 absolute transition-all duration-700 ease-in-out",
                        collapsed ? "right-8" : "right-4"
                    )}>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            suppressHydrationWarning
                            className="p-1.5 rounded-full hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground"
                        >
                            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {links.map((link) => {
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-4 pl-[22px] pr-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-700 ease-in-out group whitespace-nowrap overflow-hidden relative justify-start",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                                )}
                                title={collapsed ? link.label : undefined}
                            >
                                <div className="flex items-center justify-center shrink-0 w-5">
                                    <link.icon
                                        className={cn(
                                            "h-5 w-5 transition-colors duration-700 ease-in-out shrink-0",
                                            isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground group-hover:text-sidebar-foreground",
                                        )}
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <span className={cn(
                                    "font-semibold transition-all duration-700 ease-in-out",
                                    collapsed ? "opacity-0" : "opacity-100"
                                )}>
                                    {link.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / Sign Out */}
                {showSignOut && <div className="p-4 border-t border-border mt-auto">
                    <button
                        onClick={() => setShowLogoutDialog(true)}
                        className={cn(
                            "flex items-center gap-4 w-full pl-[22px] pr-4 py-3.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-700 ease-in-out cursor-pointer whitespace-nowrap overflow-hidden relative justify-start group",
                        )}
                    >
                        <div className="flex items-center justify-center shrink-0 w-5">
                            <LogOut className="h-5 w-5 shrink-0 transition-colors duration-700 ease-in-out group-hover:text-red-500" strokeWidth={2.5} />
                        </div>
                        <span className={cn(
                            "font-semibold transition-all duration-700 ease-in-out",
                            collapsed ? "opacity-0" : "opacity-100"
                        )}>
                            Sign out
                        </span>
                    </button>
                </div>}
            </aside>

            {/* Mobile Drawer Navigation */}
            <div className="md:hidden">
                <Drawer
                    open={!collapsed && isMobile}
                    onOpenChange={(open) => setCollapsed(!open)}
                    direction="left"
                >
                    <DrawerContent className="h-screen w-[280px] bg-sidebar text-sidebar-foreground border-r border-border p-0 rounded-none">
                        <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="h-20 flex shrink-0 items-center pl-[20px] pr-4 border-b border-border relative">
                                <div className="flex items-center">
                                    <img
                                        src="/assets/image/FinShield.svg"
                                        alt="FinShield Logo"
                                        className="h-9 w-auto object-contain"
                                    />
                                    <div className="overflow-hidden whitespace-nowrap ml-3">
                                        <span className="font-bold text-xl tracking-tight text-sidebar-foreground truncate">{title}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 absolute right-4">
                                    <button
                                        onClick={() => setCollapsed(true)}
                                        className="p-1.5 rounded-full hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {links.map((link) => {
                                    const isActive = pathname === link.href

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setCollapsed(true)} // Close drawer on link click
                                            className={cn(
                                                "flex items-center gap-4 pl-[22px] pr-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group whitespace-nowrap overflow-hidden relative justify-start",
                                                isActive
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                                            )}
                                        >
                                            <div className="flex items-center justify-center shrink-0 w-5">
                                                <link.icon
                                                    className={cn(
                                                        "h-5 w-5 shrink-0",
                                                        isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground group-hover:text-sidebar-foreground",
                                                    )}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            <span className="font-semibold">
                                                {link.label}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Footer / Sign Out */}
                            {showSignOut && <div className="p-4 border-t border-border mt-auto">
                                <button
                                    onClick={() => {
                                        setCollapsed(true)
                                        setShowLogoutDialog(true)
                                    }}
                                    className="flex items-center gap-4 w-full pl-[22px] pr-4 py-3.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 cursor-pointer whitespace-nowrap overflow-hidden relative justify-start group"
                                >
                                    <div className="flex items-center justify-center shrink-0 w-5">
                                        <LogOut className="h-5 w-5 shrink-0 transition-colors duration-300 group-hover:text-red-500" strokeWidth={2.5} />
                                    </div>
                                    <span className="font-semibold">
                                        Sign out
                                    </span>
                                </button>
                            </div>}
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            {/* Confirm Sign Out Dialog */}
            {showSignOut && <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be logged out of your account and redirected to the login page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => logout()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Sign out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>}
        </>
    )
}

