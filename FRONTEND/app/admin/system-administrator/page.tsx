"use client"

import { AlertTriangle, ClipboardList, ShieldAlert } from "lucide-react"
import { SystemStatusPanel } from "@/components/system/SystemStatusPanel"
import { useSystemStatus } from "@/hooks/system-admin/use-system-status"

export default function SystemAdministratorDashboard() {
  const { data } = useSystemStatus()
  return <div className="space-y-7"><header className="border-b pb-5"><p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">Technical operations console</p><h1 className="mt-2 text-3xl font-bold tracking-tight">System Administrator Dashboard</h1><p className="mt-1 text-sm text-muted-foreground">Sanitized operational telemetry, security events, and audit activity.</p></header><SystemStatusPanel compact /><section className="grid gap-4 md:grid-cols-3"><article className="rounded-2xl border bg-card p-5"><AlertTriangle className="h-5 w-5 text-amber-600" /><p className="mt-4 text-3xl font-black">{data?.failedBackgroundJobs.length ?? 0}</p><p className="text-sm text-muted-foreground">Failed background jobs</p></article><article className="rounded-2xl border bg-card p-5"><ShieldAlert className="h-5 w-5 text-red-600" /><p className="mt-4 text-3xl font-black">{data?.recentSecurityEvents.length ?? 0}</p><p className="text-sm text-muted-foreground">Recent security events</p></article><article className="rounded-2xl border bg-card p-5"><ClipboardList className="h-5 w-5 text-sky-600" /><p className="mt-4 text-3xl font-black">{data?.recentAuditEvents.length ?? 0}</p><p className="text-sm text-muted-foreground">Recent audit events</p></article></section></div>
}
