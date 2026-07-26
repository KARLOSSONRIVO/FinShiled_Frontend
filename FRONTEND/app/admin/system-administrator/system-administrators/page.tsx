"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, RotateCcw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { SystemAdminService } from "@/services/system-admin.service"
import type { User } from "@/lib/types"

type Action = { user: User; kind: "enable" | "disable" | "reset" } | null
const isActive = (user: User) => String(user.status).toLowerCase() === "active"

export default function SystemAdministratorsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [createConfirmation, setCreateConfirmation] = useState("")
  const [action, setAction] = useState<Action>(null)
  const [reason, setReason] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const { data, isLoading, isError } = useQuery({ queryKey: ["system-administrators"], queryFn: SystemAdminService.list })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["system-administrators"] })
  const createMutation = useMutation({ mutationFn: () => SystemAdminService.create({ email, username, confirmation: createConfirmation }), onSuccess: () => { toast.success("System Administrator created"); setCreateOpen(false); setEmail(""); setUsername(""); setCreateConfirmation(""); refresh() }, onError: (error: any) => toast.error(error?.response?.data?.message || "System Administrator could not be created") })
  const actionMutation = useMutation({ mutationFn: async () => {
    if (!action) return
    const id = action.user.id || action.user._id
    if (action.kind === "reset") return SystemAdminService.resetAccess(id, { reason, confirmation })
    return SystemAdminService.updateStatus(id, { status: action.kind === "enable" ? "active" : "disabled", reason, confirmation })
  }, onSuccess: () => { toast.success(action?.kind === "reset" ? "Access reset" : "Account status updated"); setAction(null); setReason(""); setConfirmation(""); refresh() }, onError: (error: any) => toast.error(error?.response?.data?.message || "Protected action failed") })

  return <div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">System Administrators</h2><p className="text-sm text-muted-foreground">Protected technical accounts are managed only in this workflow.</p></div><Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Create System Administrator</Button></div>{isLoading ? <Skeleton className="h-64 rounded-2xl" /> : isError ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">System Administrator accounts could not be loaded.</div> : !data?.items.length ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No System Administrator accounts found.</div> : <div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full text-sm"><thead className="border-b bg-muted/40 text-left"><tr><th className="p-4">Account</th><th className="p-4">Status</th><th className="p-4">MFA</th><th className="p-4">Last login</th><th className="p-4 text-right">Protected actions</th></tr></thead><tbody>{data.items.map((user) => <tr key={user.id || user._id} className="border-b last:border-0"><td className="p-4"><p className="font-semibold">{user.username}</p><p className="text-muted-foreground">{user.email}</p></td><td className="p-4 capitalize">{user.status}</td><td className="p-4"><span className="inline-flex items-center gap-1 text-emerald-700"><ShieldCheck className="h-4 w-4" />Required</span></td><td className="p-4">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td><td className="p-4"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setAction({ user, kind: "reset" })}><RotateCcw className="mr-1 h-3.5 w-3.5" />Reset access</Button><Button size="sm" variant={isActive(user) ? "destructive" : "default"} onClick={() => setAction({ user, kind: isActive(user) ? "disable" : "enable" })}>{isActive(user) ? "Disable" : "Enable"}</Button></div></td></tr>)}</tbody></table></div>}

  <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>Create System Administrator</DialogTitle><DialogDescription>A temporary password is generated and emailed. The account must change it and complete MFA.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="system-admin-username">Username</Label><Input id="system-admin-username" value={username} onChange={(event) => setUsername(event.target.value)} /></div><div><Label htmlFor="system-admin-email">Email</Label><Input id="system-admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><Label htmlFor="system-admin-confirm">Type CREATE SYSTEM ADMIN</Label><Input id="system-admin-confirm" value={createConfirmation} onChange={(event) => setCreateConfirmation(event.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button disabled={!email || username.length < 3 || createConfirmation !== "CREATE SYSTEM ADMIN" || createMutation.isPending} onClick={() => createMutation.mutate()}>Create account</Button></DialogFooter></DialogContent></Dialog>

  <Dialog open={!!action} onOpenChange={(open) => !open && setAction(null)}><DialogContent><DialogHeader><DialogTitle>{action?.kind === "reset" ? "Reset System Administrator access" : `${action?.kind === "disable" ? "Disable" : "Enable"} System Administrator`}</DialogTitle><DialogDescription>This action invalidates active sessions and is written to the internal Audit Log.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="protected-reason">Reason</Label><Input id="protected-reason" value={reason} onChange={(event) => setReason(event.target.value)} /></div><div><Label htmlFor="protected-confirm">Type {action?.user.email} to confirm</Label><Input id="protected-confirm" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setAction(null)}>Cancel</Button><Button variant={action?.kind === "disable" ? "destructive" : "default"} disabled={reason.trim().length < 5 || confirmation.toLowerCase() !== (action?.user.email || "").toLowerCase() || actionMutation.isPending} onClick={() => actionMutation.mutate()}>Confirm action</Button></DialogFooter></DialogContent></Dialog></div>
}
