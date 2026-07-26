"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Organization, User } from "@/lib/types"

type AssignableRole = "AUDITOR" | "REGULATOR" | "COMPANY_MANAGER" | "COMPANY_USER"

export function AssignRoleDialog({ user, organizations, open, onOpenChange, onConfirm }: {
  user: User
  organizations: Organization[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (role: AssignableRole, confirmation: string, orgId?: string) => void
}) {
  const initialRole = (["AUDITOR", "REGULATOR", "COMPANY_MANAGER", "COMPANY_USER"].includes(user.role) ? user.role : "COMPANY_USER") as AssignableRole
  const [role, setRole] = useState<AssignableRole>(initialRole)
  const [orgId, setOrgId] = useState(typeof user.orgId === "string" ? user.orgId : user.orgId?._id || "")
  const [confirmation, setConfirmation] = useState("")
  const requiresOrganization = role === "COMPANY_MANAGER" || role === "COMPANY_USER"
  const targetEmail = user.email || ""
  const valid = confirmation.trim().toLowerCase() === targetEmail.toLowerCase() && (!requiresOrganization || !!orgId)

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change business role</DialogTitle>
        <DialogDescription>This invalidates the user&apos;s active sessions. System Administrator and Owner cannot be assigned here.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2"><Label>Role</Label><Select value={role} onValueChange={(value) => setRole(value as AssignableRole)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="COMPANY_MANAGER">Company Manager</SelectItem><SelectItem value="COMPANY_USER">Company User</SelectItem><SelectItem value="AUDITOR">Auditor</SelectItem><SelectItem value="REGULATOR">Regulator</SelectItem></SelectContent></Select></div>
        {requiresOrganization && <div className="space-y-2"><Label>Organization</Label><Select value={orgId} onValueChange={setOrgId}><SelectTrigger><SelectValue placeholder="Select an organization" /></SelectTrigger><SelectContent>{organizations.map(org => <SelectItem key={org.id || org._id} value={org.id || org._id || ""}>{org.name}</SelectItem>)}</SelectContent></Select></div>}
        <div className="space-y-2"><Label htmlFor="role-confirmation">Type {targetEmail} to confirm</Label><Input id="role-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!valid} onClick={() => { onConfirm(role, confirmation, requiresOrganization ? orgId : undefined); onOpenChange(false) }}>Change role</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
