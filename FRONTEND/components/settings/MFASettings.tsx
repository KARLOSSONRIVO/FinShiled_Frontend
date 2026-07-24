"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Copy, Loader2, Mail, ShieldCheck, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { AuthService, type MfaMethod } from "@/services/auth.service"
import { useAuthContext } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

type Action = "ADD_AUTHENTICATOR" | "REMOVE_AUTHENTICATOR" | "CHANGE_PREFERRED_METHOD"
type Stage = "password" | "email" | "authenticator"

const unwrap = (response: any) => response?.data || response

export function MFASettings() {
    const router = useRouter()
    const { clearSession, refreshUser } = useAuthContext()
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [action, setAction] = useState<Action>("ADD_AUTHENTICATOR")
    const [stage, setStage] = useState<Stage>("password")
    const [password, setPassword] = useState("")
    const [code, setCode] = useState("")
    const [tempToken, setTempToken] = useState("")
    const [stepUpToken, setStepUpToken] = useState("")
    const [preferredTarget, setPreferredTarget] = useState<MfaMethod>("email")
    const [setup, setSetup] = useState<{ qrCodeUrl: string; manualKey: string } | null>(null)

    async function loadSettings() {
        setLoading(true)
        try {
            setSettings(unwrap(await AuthService.getMfaSettings()))
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "MFA settings could not be loaded")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { void loadSettings() }, [])

    function begin(nextAction: Action, method?: MfaMethod) {
        setAction(nextAction)
        setPreferredTarget(method || "email")
        setStage("password")
        setPassword("")
        setCode("")
        setTempToken("")
        setStepUpToken("")
        setSetup(null)
        setDialogOpen(true)
    }

    async function confirmPassword() {
        if (!password) return
        setLoading(true)
        try {
            const data = unwrap(await AuthService.authorizeMfaSetting({ password, action }))
            setTempToken(data.tempToken)
            setStage("email")
            setCode("")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Password confirmation failed")
        } finally {
            setLoading(false)
        }
    }

    async function finishAndReload(message: string) {
        setDialogOpen(false)
        toast.success(message)
        await Promise.all([loadSettings(), refreshUser()])
    }

    async function requireFreshLogin(message: string) {
        setDialogOpen(false)
        toast.success(message)
        clearSession()
        router.replace("/login")
    }

    async function confirmEmail() {
        if (!tempToken || code.length !== 6) return
        setLoading(true)
        try {
            const authorization = unwrap(await AuthService.verifyMfaSettingAuthorization(tempToken, code))
            const token = authorization.stepUpToken
            setStepUpToken(token)
            setCode("")

            if (action === "ADD_AUTHENTICATOR") {
                setSetup(unwrap(await AuthService.startAuthenticatorSetup(token)))
                setStage("authenticator")
            } else if (action === "REMOVE_AUTHENTICATOR") {
                await AuthService.removeAuthenticator(token)
                await requireFreshLogin("Authenticator removed. Sign in again with email verification.")
            } else {
                await AuthService.changePreferredMfaMethod(token, preferredTarget)
                await finishAndReload(`Preferred method changed to ${preferredTarget === "email" ? "email" : "authenticator"}`)
            }
        } catch (error: any) {
            setCode("")
            toast.error(error?.response?.data?.message || "Email verification failed")
        } finally {
            setLoading(false)
        }
    }

    async function confirmAuthenticator() {
        if (!stepUpToken || code.length !== 6) return
        setLoading(true)
        try {
            await AuthService.completeAuthenticatorSetup(stepUpToken, code)
            await finishAndReload("Authenticator application added")
        } catch (error: any) {
            setCode("")
            toast.error(error?.response?.data?.message || "Authenticator code was not accepted")
        } finally {
            setLoading(false)
        }
    }

    if (loading && !settings) {
        return <div className="grid min-h-56 place-items-center rounded-xl border bg-card"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
    }

    const totpEnabled = Boolean(settings?.totpEnabled)

    return (
        <div className="space-y-6 rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
            <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-5 w-5 text-emerald-600" />Multi-Factor Authentication</h4>
                <p className="mt-1 text-sm text-muted-foreground">MFA is required and cannot be turned off.</p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:bg-emerald-950/20">
                    <div className="flex min-w-0 items-center gap-3"><Mail className="h-5 w-5 shrink-0 text-emerald-700" /><div><p className="text-sm font-semibold">Email verification</p><p className="truncate text-xs text-muted-foreground">{settings?.maskedEmail} · permanent fallback</p></div></div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle className="h-4 w-4" />Enabled</span>
                </div>
                <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-slate-600" /><div><p className="text-sm font-semibold">Authenticator application</p><p className="text-xs text-muted-foreground">Google Authenticator, Microsoft Authenticator, or Authy</p></div></div>
                    <div className="flex flex-wrap gap-2">
                        {totpEnabled ? <Button size="sm" variant="destructive" onClick={() => begin("REMOVE_AUTHENTICATOR")}>Remove</Button> : <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => begin("ADD_AUTHENTICATOR")}>Add authenticator</Button>}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border p-4">
                <p className="text-sm font-semibold">Preferred login method</p>
                <p className="mt-1 text-xs text-muted-foreground">The other enabled method remains available under More options.</p>
                <div className="mt-3 flex gap-2">
                    <Button size="sm" variant={settings?.defaultMfaMethod === "email" ? "default" : "outline"} onClick={() => settings?.defaultMfaMethod !== "email" && begin("CHANGE_PREFERRED_METHOD", "email")}>Email</Button>
                    {totpEnabled && <Button size="sm" variant={settings?.defaultMfaMethod === "authenticator" ? "default" : "outline"} onClick={() => settings?.defaultMfaMethod !== "authenticator" && begin("CHANGE_PREFERRED_METHOD", "authenticator")}>Authenticator</Button>}
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => !loading && setDialogOpen(open)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>{stage === "password" ? "Confirm your password" : stage === "email" ? "Verify through email" : "Connect authenticator"}</DialogTitle><DialogDescription>Sensitive MFA changes require your password and a fresh email verification.</DialogDescription></DialogHeader>
                    {stage === "password" && <div className="space-y-2 py-3"><Label htmlFor="mfa-password">Current password</Label><Input id="mfa-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>}
                    {stage === "email" && <div className="space-y-4 py-3"><p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {settings?.maskedEmail}.</p><div className="flex justify-center"><InputOTP maxLength={6} value={code} onChange={setCode} disabled={loading}><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup></InputOTP></div></div>}
                    {stage === "authenticator" && setup && <div className="space-y-4 py-3"><div className="mx-auto w-fit rounded-xl border bg-white p-2"><img src={setup.qrCodeUrl} alt="Authenticator setup QR code" className="h-44 w-44" /></div><div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Manual setup key</p><div className="mt-1 flex items-center justify-between gap-2"><code className="break-all text-xs">{setup.manualKey}</code><button type="button" aria-label="Copy manual setup key" onClick={() => navigator.clipboard.writeText(setup.manualKey).then(() => toast.success("Setup key copied"))}><Copy className="h-4 w-4" /></button></div></div><div className="flex justify-center"><InputOTP maxLength={6} value={code} onChange={setCode} disabled={loading}><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup></InputOTP></div></div>}
                    <DialogFooter><Button variant="outline" disabled={loading} onClick={() => setDialogOpen(false)}>Cancel</Button><Button disabled={loading || (stage === "password" ? !password : code.length !== 6)} onClick={stage === "password" ? confirmPassword : stage === "email" ? confirmEmail : confirmAuthenticator}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{stage === "password" ? "Send email code" : stage === "email" ? "Verify email" : "Verify and enable"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
