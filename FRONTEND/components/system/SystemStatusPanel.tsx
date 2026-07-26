"use client"

import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react"
import { useSystemStatus } from "@/hooks/system-admin/use-system-status"
import { Skeleton } from "@/components/ui/skeleton"

const labels: Record<string, string> = { api: "API", database: "Database", redis: "Redis", ai: "AI Service", ipfs: "IPFS", blockchain: "Blockchain Network", email: "Email Service" }

export function SystemStatusPanel({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, isError, refetch } = useSystemStatus()
  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading system status">{Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}</div>
  if (isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900" role="alert"><div className="flex items-center gap-2 font-semibold"><XCircle className="h-5 w-5" />System status could not be loaded</div><button className="mt-3 text-sm underline" onClick={() => refetch()}>Try again</button></div>
  if (!data?.services.length) return <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No service checks are available.</div>

  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.services.map((service) => {
    const healthy = service.status === "operational" || service.status === "configured"
    const Icon = healthy ? CheckCircle2 : AlertTriangle
    return <article key={service.name} className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm" aria-label={`${labels[service.name] || service.name}: ${service.status}`}><div className={`absolute inset-x-0 top-0 h-1 ${healthy ? "bg-emerald-500" : "bg-amber-500"}`} /><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{labels[service.name] || service.name}</p><p className="mt-2 text-lg font-bold capitalize">{service.status.replace("_", " ")}</p></div><Icon className={`h-6 w-6 ${healthy ? "text-emerald-600" : "text-amber-600"}`} /></div>{!compact && <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{service.latencyMs} ms</span><span>{service.errorCode || "Check passed"}</span></div>}</article>
  })}</div>{!compact && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-4 w-4" />Last health check {new Date(data.lastHealthCheck).toLocaleString()}</div>}</div>
}
