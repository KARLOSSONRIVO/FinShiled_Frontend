"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2, LogOut, Mail, ShieldCheck, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { AuthService, type MfaMethod, type TemporaryAuthResponse } from "@/services/auth.service"
import { useAuthContext } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type View = "methods" | "email" | "authenticator"

export default function MfaPage() {
    const router = useRouter()
    const { completeMfaAuthentication, clearSession } = useAuthContext()
    const [auth, setAuth] = useState<TemporaryAuthResponse | null>(null)
    const [view, setView] = useState<View>("methods")
    const [code, setCode] = useState("")
    const [busy, setBusy] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)
    const [resendAt, setResendAt] = useState(0)
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const raw = sessionStorage.getItem("finshield_temp_auth")
        if (!raw) {
            router.replace("/login")
            return
        }
        try {
            const parsed = JSON.parse(raw) as TemporaryAuthResponse
            if (!parsed.tempToken || parsed.authState !== "MFA_CHALLENGE_REQUIRED") {
                throw new Error("invalid temporary state")
            }
            setAuth(parsed)
            setView("methods")
            if (parsed.emailCodeSent) {
                setResendAt(parsed.resendAvailableAt ? new Date(parsed.resendAvailableAt).getTime() : Date.now() + 60_000)
            }
        } catch {
            sessionStorage.removeItem("finshield_temp_auth")
            router.replace("/login")
        }
    }, [router])

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000)
        return () => window.clearInterval(timer)
    }, [])

    const resendSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000))
    const preferred = auth?.defaultMfaMethod || "email"
    const methods = auth?.enabledMfaMethods || ["email"]
    const alternative = preferred === "email" ? "authenticator" : "email"
    const alternativeEnabled = methods.includes(alternative)

    const heading = useMemo(() => {
        if (view === "email") return "Check your email"
        if (view === "authenticator") return "Authenticator application"
        return "Two-factor authentication"
    }, [view])

    function persist(next: TemporaryAuthResponse) {
        setAuth(next)
        sessionStorage.setItem("finshield_temp_auth", JSON.stringify(next))
    }

    async function chooseMethod(method: MfaMethod) {
        if (!auth) return
        setBusy(true)
        setCode("")
        try {
            if (auth.selectedMethod !== method) {
                const response = await AuthService.selectMfaMethod(auth.tempToken, method)
                const next = { ...auth, ...(response.data || response), selectedMethod: method }
                persist(next)
                if (method === "email") {
                    setResendAt(next.resendAvailableAt ? new Date(next.resendAvailableAt).getTime() : Date.now() + 60_000)
                }
            }
            setView(method === "email" ? "email" : "authenticator")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Authentication method could not be selected")
        } finally {
            setBusy(false)
        }
    }

    async function verify() {
        if (!auth || code.length !== 6) return
        const method: MfaMethod = view === "authenticator" ? "authenticator" : "email"
        setBusy(true)
        try {
            const response = await AuthService.verifyMfa(auth.tempToken, { code, method })
            const data = response.data || response
            if (data.authState === "LOGIN_REQUIRED") {
                sessionStorage.removeItem("finshield_temp_auth")
                toast.success("MFA is active. Sign in again with your new password.")
                router.replace("/login")
                return
            }
            completeMfaAuthentication(response)
            toast.success(`Identity verified through ${method === "email" ? "email" : "your authenticator"}`)
        } catch (error: any) {
            setCode("")
            toast.error(error?.response?.data?.message || "The verification code was not accepted")
        } finally {
            setBusy(false)
        }
    }

    async function resend() {
        if (!auth || resendSeconds > 0) return
        setBusy(true)
        try {
            const response = await AuthService.requestEmailCode(auth.tempToken)
            const data = response.data || response
            setResendAt(data.resendAvailableAt ? new Date(data.resendAvailableAt).getTime() : Date.now() + 60_000)
            setCode("")
            toast.success("A new verification code was sent")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "A new code could not be sent")
        } finally {
            setBusy(false)
        }
    }

    async function cancel() {
        if (auth?.tempToken) await AuthService.cancelMfaSession(auth.tempToken).catch(() => null)
        clearSession()
        router.replace("/login")
    }

    if (!auth) {
        return <main className="grid min-h-screen place-items-center bg-[#f5f5f0]"><Loader2 className="h-7 w-7 animate-spin text-emerald-600" aria-label="Loading authentication" /></main>
    }

    return (
        <main className="min-h-screen bg-[#f5f5f0] text-[#17201d]">
            <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[0.82fr_1.18fr]">
                <aside className="hidden bg-[#101714] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                    <Image src="/assets/image/FinShield.svg" alt="FinShield" width={112} height={112} className="h-24 w-auto self-center" priority />
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-300">Identity checkpoint</p>
                        <h2 className="mt-4 text-4xl font-semibold leading-tight">One final proof.<br />Then you&apos;re in.</h2>
                        <p className="mt-5 max-w-sm leading-7 text-slate-300">Password verification opens only this checkpoint. FinShield creates your working session after the second factor succeeds.</p>
                    </div>
                    <ol className="space-y-5 border-l border-white/15 pl-7 text-sm">
                        <li className="relative"><span className="absolute -left-[35px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-300" /><strong>Password confirmed</strong><p className="mt-1 text-slate-400">No dashboard access was granted.</p></li>
                        <li className="relative"><span className="absolute -left-[35px] top-1 h-3.5 w-3.5 rounded-full border-2 border-emerald-300 bg-[#101714]" /><strong>Verify identity</strong><p className="mt-1 text-slate-400">Use email or an enrolled authenticator.</p></li>
                        <li className="relative"><span className="absolute -left-[35px] top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-500 bg-[#101714]" /><strong>Secure session</strong><p className="mt-1 text-slate-400">Issued only after successful MFA.</p></li>
                    </ol>
                </aside>

                <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                    <div className="w-full max-w-md">
                        <Image src="/assets/image/FinShield.svg" alt="FinShield" width={150} height={90} className="mx-auto mb-8 h-24 w-auto lg:hidden" priority />
                        <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(16,23,20,0.10)] sm:p-9">
                            <div className="mb-7 flex items-start gap-4">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><ShieldCheck className="h-6 w-6" /></div>
                                <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-700">Mandatory MFA</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{heading}</h1></div>
                            </div>

                            {view === "methods" && (
                                <div className="space-y-4">
                                    <p className="text-sm leading-6 text-slate-600">Confirm your identity to continue.</p>
                                    <Button className="h-12 w-full justify-start gap-3 bg-emerald-600 px-4 text-white hover:bg-emerald-700" disabled={busy} onClick={() => chooseMethod(preferred)}>
                                        {preferred === "email" ? <Mail className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                                        {preferred === "email" ? "Verify through email" : "Use authenticator application"}
                                    </Button>
                                    {alternativeEnabled && (
                                        <div className="border-t pt-4">
                                            <button type="button" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} className="flex w-full items-center justify-between rounded-lg py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><span>More options</span><ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} /></button>
                                            {moreOpen && <Button variant="outline" className="mt-2 h-11 w-full justify-start gap-3" disabled={busy} onClick={() => chooseMethod(alternative)}>{alternative === "email" ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}{alternative === "email" ? "Verify through email" : "Authenticator application"}</Button>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(view === "email" || view === "authenticator") && (
                                <div className="space-y-6">
                                    <p className="text-sm leading-6 text-slate-600">{view === "email" ? `A verification code was sent to ${auth.maskedEmail}.` : "Enter the current 6-digit code from your authenticator application."}</p>
                                    <div className="flex justify-center">
                                        <InputOTP maxLength={6} value={code} onChange={setCode} disabled={busy} autoFocus>
                                            <InputOTPGroup>
                                                {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} />)}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <Button className="h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={busy || code.length !== 6} onClick={verify}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Verify code</Button>
                                    {view === "email" && <button type="button" disabled={busy || resendSeconds > 0} onClick={resend} className="w-full text-center text-sm font-medium text-emerald-700 disabled:text-slate-400">{resendSeconds > 0 ? `Send another code in ${resendSeconds}s` : "Send another code"}</button>}
                                    {auth.authState === "MFA_CHALLENGE_REQUIRED" && <button type="button" onClick={() => { setCode(""); setView("methods") }} className="w-full text-center text-sm text-slate-500 hover:text-slate-800">Choose another method</button>}
                                </div>
                            )}

                            <button type="button" onClick={cancel} className="mt-7 flex w-full items-center justify-center gap-2 border-t pt-5 text-sm text-slate-500 hover:text-slate-800"><LogOut className="h-4 w-4" />Log out and cancel session</button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
