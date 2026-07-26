"use client"

import Link from "next/link"
import { AlertTriangle, Building2, CheckCircle, FileText, UserCheck, Users, UserX } from "lucide-react"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { DashboardContentSkeleton } from "@/components/skeletons/dashboard-content-skeleton"
import { useAuth } from "@/hooks/global/use-auth"
import { useOwnerDashboard } from "@/hooks/owner/use-owner-dashboard"

export default function OwnerDashboard() {
  const { user } = useAuth()
  const shouldFetch = !user?.mustChangePassword
  const { companiesCount, totalUsers, activeUsers, disabledUsers, totalInvoices, verifiedInvoices, flaggedCount, loading, isError } = useOwnerDashboard({ enabled: shouldFetch })

  if (!shouldFetch) return null
  if (loading) return <DashboardContentSkeleton />
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900" role="alert"><h2 className="font-semibold">Owner Dashboard could not be loaded</h2><p className="mt-1 text-sm">Refresh the page or try again after the API is available.</p></div>

  const allEmpty = totalUsers + companiesCount + totalInvoices === 0
  return <div className="space-y-7"><header className="border-b pb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Business administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Owner Dashboard</h1><p className="mt-1 text-sm text-muted-foreground">Welcome back, {user?.username || "Owner"}. Review business accounts, organizations, and invoices.</p></header>{allEmpty && <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">No business activity has been registered yet. Create an organization or business user to begin.</div>}<section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4" aria-label="Owner platform statistics"><Link href="/admin/owner/users" aria-label="Open User Management"><StatsCard title="Total Users" value={totalUsers} icon={Users} description="Business users; technical accounts excluded" /></Link><Link href="/admin/owner/organizations" aria-label="Open Organization Management"><StatsCard title="Total Organizations" value={companiesCount} icon={Building2} description="Registered organizations" /></Link><StatsCard title="Active Users" value={activeUsers} icon={UserCheck} description="Accounts with platform access" /><StatsCard title="Disabled Users" value={disabledUsers} icon={UserX} description="Business accounts without access" /><StatsCard title="Total Invoices" value={totalInvoices} icon={FileText} description="Invoices across the platform" /><StatsCard title="Verified Invoices" value={verifiedInvoices} icon={CheckCircle} description="AI verification completed cleanly" /><StatsCard title="Flagged Invoices" value={flaggedCount} icon={AlertTriangle} description="Requires business attention" /></section></div>
}
