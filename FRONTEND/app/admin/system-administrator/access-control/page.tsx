import { Check, Shield } from "lucide-react"

const rows = [
  ["System Administrator accounts", "Manage", "Protected workflow only"],
  ["Audit Logs", "View", "Append-only records"],
  ["System and integration status", "View", "Sanitized telemetry"],
  ["Platform configuration", "Manage", "Allowlisted settings"],
  ["Maintenance mode", "Manage", "Typed confirmation"],
  ["Business records", "Read-only when troubleshooting", "No financial or review changes"],
]

export default function TechnicalAccessControlPage() { return <div className="space-y-6"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">Permission boundary</p><h2 className="mt-2 text-2xl font-bold">Technical Access Control</h2><p className="text-sm text-muted-foreground">System Administrator access does not inherit Owner business permissions.</p></div><div className="overflow-hidden rounded-2xl border bg-card"><div className="grid grid-cols-[1.2fr_.8fr_1fr] border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span>Surface</span><span>Access</span><span>Control</span></div>{rows.map(([surface, access, control]) => <div key={surface} className="grid grid-cols-[1.2fr_.8fr_1fr] items-center border-b px-5 py-4 text-sm last:border-0"><span className="font-medium">{surface}</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{access}</span><span className="text-muted-foreground">{control}</span></div>)}</div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><Shield className="mb-2 h-5 w-5" />Passwords, verification codes, authenticator secrets, tokens, SMTP credentials, connection strings, environment values, and private keys are never available here.</div></div> }
