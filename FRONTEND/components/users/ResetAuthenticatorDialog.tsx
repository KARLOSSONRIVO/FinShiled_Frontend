"use client"

import { useState } from "react"
import { RotateCcw, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@/lib/types"
import { UserService } from "@/services/user.service"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ResetAuthenticatorDialog({ user, onReset }: { user: User; onReset?: () => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const email = user.email || ""
  const valid = reason.trim().length >= 5 && confirmation.trim().toLowerCase() === email.toLowerCase()

  async function confirm() {
    if (!valid) return
    setLoading(true)
    try {
      await UserService.resetAuthenticator(user.id || user._id, reason.trim(), confirmation)
      toast.success("Authenticator reset. Email MFA remains enabled.")
      setOpen(false)
      setReason("")
      setConfirmation("")
      onReset?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Authenticator could not be reset")
    } finally { setLoading(false) }
  }

  return <Dialog open={open} onOpenChange={(next) => !loading && setOpen(next)}><DialogTrigger asChild><Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><RotateCcw className="h-3.5 w-3.5" />Reset MFA app</Button></DialogTrigger><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-600" />Reset authenticator application?</DialogTitle><DialogDescription>This removes the authenticator from {email}, revokes active sessions, keeps email MFA active, sends a security alert, and writes an audit event.</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor={`mfa-reason-${user.id || user._id}`}>Reason for reset</Label><Input id={`mfa-reason-${user.id || user._id}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} /></div><div className="space-y-2"><Label htmlFor={`mfa-confirm-${user.id || user._id}`}>Type {email} to confirm</Label><Input id={`mfa-confirm-${user.id || user._id}`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></div><DialogFooter><Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>Cancel</Button><Button variant="destructive" disabled={loading || !valid} onClick={confirm}>{loading ? "Resetting…" : "Reset authenticator"}</Button></DialogFooter></DialogContent></Dialog>
}
