"use client"

import { useQuery } from "@tanstack/react-query"
import { ShieldAlert } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { SystemService } from "@/services/system.service"

export default function SecurityMonitoringPage() {
  const { data = [], isLoading, isError } = useQuery({ queryKey: ["security-events"], queryFn: SystemService.getSecurityEvents })
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Security Monitoring</h2><p className="text-sm text-muted-foreground">Failed authentication, MFA, lockout, and privileged-access events.</p></div>{isLoading ? <Skeleton className="h-72 rounded-2xl" /> : isError ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6">Security events could not be loaded.</div> : data.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground"><ShieldAlert className="mx-auto mb-3 h-7 w-7" />No recent security events.</div> : <div className="divide-y overflow-hidden rounded-2xl border bg-card">{data.map((event: any) => <article key={event.id} className="flex gap-4 p-5"><ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600" /><div className="min-w-0"><p className="font-semibold">{event.summary || event.action}</p><p className="mt-1 text-sm text-muted-foreground">{event.actorRole || "SYSTEM"} · {new Date(event.createdAt).toLocaleString()}</p></div></article>)}</div>}</div>
}
