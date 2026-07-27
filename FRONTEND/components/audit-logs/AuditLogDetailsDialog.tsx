"use client"

import { MapPin, ShieldCheck } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { AuditLog } from "@/lib/types"

function DetailItem({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="space-y-1 rounded-lg border border-border/70 bg-muted/20 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className={mono ? "break-all font-mono text-xs text-foreground" : "break-words text-sm text-foreground"}>
                {value || "—"}
            </div>
        </div>
    )
}

export function AuditLogDetailsDialog({
    log,
    onClose,
}: {
    log: AuditLog | null
    onClose: () => void
}) {
    const timestamp = log ? new Date(log.createdAt) : null

    return (
        <Dialog open={!!log} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-700 p-2 text-white">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>Audit event details</DialogTitle>
                            <DialogDescription>Protected forensic context captured when the event occurred.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {log && (
                    <div className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailItem label="Event ID" value={log.id} mono />
                            <DetailItem label="Request ID" value={log.requestId} mono />
                            <DetailItem label="Outcome" value={log.outcome || "UNKNOWN"} />
                            <DetailItem label="Timestamp (UTC)" value={timestamp?.toISOString()} />
                            <DetailItem label="Timestamp (local)" value={timestamp?.toLocaleString()} />
                            <DetailItem label="Actor" value={`${log.actorRole?.replace(/_/g, " ") || "Unknown"} · ${log.actor?.email || "Unknown"}`} />
                            <DetailItem label="Action" value={String(log.action).replace(/_/g, " ")} />
                            <DetailItem label="Target" value={[log.targetType, log.targetId].filter(Boolean).join(" · ")} />
                            <DetailItem label="Organization ID" value={log.organizationId} mono />
                            <DetailItem label="IP address" value={log.ipAddress || log.ip} mono />
                            <DetailItem
                                label="Approximate location"
                                value={(
                                    <span className="inline-flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-700" />
                                        {log.location?.display || "Location unavailable"}
                                    </span>
                                )}
                            />
                            <DetailItem label="Location status" value={log.location?.lookupStatus || "NOT_REQUESTED"} />
                        </div>

                        <section className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">User Agent</h3>
                            <pre className="whitespace-pre-wrap break-all rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs text-muted-foreground">
                                {log.userAgent || "User Agent unavailable"}
                            </pre>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                            <p className="rounded-lg border border-border bg-muted/20 p-4 text-sm">{log.summary}</p>
                        </section>

                        {log.failureReason && (
                            <section className="space-y-2">
                                <h3 className="text-sm font-semibold text-foreground">Sanitized failure reason</h3>
                                <p className="rounded-lg border border-red-200 bg-red-50 p-4 font-mono text-xs text-red-800">
                                    {log.failureReason}
                                </p>
                            </section>
                        )}

                        <section className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Sanitized event metadata</h3>
                            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-slate-950 p-4 font-mono text-xs text-slate-100">
                                {JSON.stringify(log.metadata || {}, null, 2)}
                            </pre>
                        </section>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
