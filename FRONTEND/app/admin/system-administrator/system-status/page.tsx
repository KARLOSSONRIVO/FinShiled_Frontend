import { SystemStatusPanel } from "@/components/system/SystemStatusPanel"

export default function SystemStatusPage() { return <div className="space-y-6"><div><h2 className="text-2xl font-bold">System Status</h2><p className="text-sm text-muted-foreground">Service checks expose normalized status and timing only; credentials and raw errors are never returned.</p></div><SystemStatusPanel /></div> }
