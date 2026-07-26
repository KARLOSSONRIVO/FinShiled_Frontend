"use client"

import { useState } from "react"
import { KeyRound } from "lucide-react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetTemporaryPasswordDialog({ user, onConfirm, loading = false }: { user: User; onConfirm: (confirmation: string) => void; loading?: boolean }) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const email = user.email || ""
  const valid = confirmation.trim().toLowerCase() === email.toLowerCase()
  return <Dialog open={open} onOpenChange={(next) => !loading && setOpen(next)}><DialogTrigger asChild><Button size="sm" variant="outline" disabled={!user.mustChangePassword}><KeyRound className="mr-1 h-3.5 w-3.5" />Reset password</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Reset temporary password?</DialogTitle><DialogDescription>A new temporary password will be emailed, active sessions will be invalidated, and the action will be audited. This is available only before the first-login password change.</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor={`password-reset-${user.id || user._id}`}>Type {email} to confirm</Label><Input id={`password-reset-${user.id || user._id}`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!valid || loading} onClick={() => { onConfirm(confirmation); setOpen(false); setConfirmation("") }}>{loading ? "Resetting…" : "Reset password"}</Button></DialogFooter></DialogContent></Dialog>
}
