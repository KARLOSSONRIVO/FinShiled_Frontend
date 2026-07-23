'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check, Eye, EyeOff, KeyRound, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react'
import { AuthService } from '@/services/auth.service'
import { useAuthContext } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const requirements = [
    { label: 'At least 12 characters', test: (value: string) => value.length >= 12 },
    { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
    { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
    { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
    { label: 'One special character', test: (value: string) => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value) },
]

function VisibilityButton({
    visible,
    onToggle,
    fieldName,
}: {
    visible: boolean
    onToggle: () => void
    fieldName: string
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={`${visible ? 'Hide' : 'Show'} ${fieldName}`}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
    )
}

export default function ChangeTemporaryPasswordPage() {
    const router = useRouter()
    const { user, isLoading, clearSession, logout } = useAuthContext()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (!isLoading && (!user || !user.mustChangePassword)) {
            router.replace('/login')
        }
    }, [isLoading, router, user])

    const requirementState = useMemo(
        () => requirements.map((requirement) => ({
            ...requirement,
            met: requirement.test(newPassword),
        })),
        [newPassword],
    )
    const passwordIsStrong = requirementState.every((requirement) => requirement.met)
    const passwordsMatch = Boolean(confirmPassword) && newPassword === confirmPassword
    const reusesTemporaryPassword = Boolean(newPassword) && newPassword === currentPassword
    const canSubmit = Boolean(currentPassword)
        && passwordIsStrong
        && passwordsMatch
        && !reusesTemporaryPassword
        && !isSubmitting

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!canSubmit) return
        setError('')
        setStatus('')
        setIsSubmitting(true)
        try {
            await AuthService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            })
            setStatus('Password changed. Returning you to login…')
            clearSession()
            router.replace('/login')
        } catch (requestError: any) {
            setError(
                requestError?.response?.data?.message
                || 'Password could not be changed. Check your temporary password and try again.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#f5f5f0] text-[#17201d]">
            <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
                <section className="relative hidden overflow-hidden bg-[#101714] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                    <div className="mt-8 flex justify-center">
                        <Image
                            src="/assets/image/FinShield.svg"
                            alt="FinShield"
                            width={112}
                            height={112}
                            className="h-28 w-auto object-contain"
                            priority
                        />
                    </div>
                    <div className="max-w-md">
                        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-emerald-300">
                            Secure credential handoff
                        </p>
                        <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                            Make this account yours.
                        </h1>
                        <p className="mt-5 text-base leading-7 text-slate-300">
                            The password in your welcome email is temporary. Replace it now before entering FinShield.
                        </p>
                    </div>
                    <ol className="space-y-5 border-l border-white/15 pl-7" aria-label="Account activation steps">
                        {[
                            ['01', 'Temporary login', 'Use the credential from your welcome email.'],
                            ['02', 'Private replacement', 'Choose a password only you know.'],
                            ['03', 'Fresh sign-in', 'Log in again to start a clean session.'],
                        ].map(([number, title, copy], index) => (
                            <li key={number} className="relative">
                                <span className={`absolute -left-[35px] top-1 h-3.5 w-3.5 rounded-full border-2 ${index === 1 ? 'border-emerald-300 bg-emerald-300' : 'border-slate-500 bg-[#101714]'}`} />
                                <p className="font-mono text-xs text-emerald-300">{number}</p>
                                <p className="mt-1 font-semibold">{title}</p>
                                <p className="mt-1 text-sm text-slate-400">{copy}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
                    <div className="w-full max-w-xl">
                        <div className="mb-8 flex items-center justify-between lg:hidden">
                            <Image src="/assets/image/FinShield.svg" alt="FinShield" width={132} height={52} className="h-12 w-auto" priority />
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Required</span>
                        </div>

                        <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(16,23,20,0.10)] sm:p-9">
                            <div className="mb-7 flex items-start gap-4">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                                    <LockKeyhole className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-700">First-login security</p>
                                    <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Change temporary password</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Protected pages stay locked until this step is complete.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current temporary password</Label>
                                    <div className="relative">
                                        <Input
                                            id="current-password"
                                            type={showCurrent ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(event) => setCurrentPassword(event.target.value)}
                                            autoComplete="current-password"
                                            className="h-12 pr-11"
                                            required
                                        />
                                        <VisibilityButton visible={showCurrent} onToggle={() => setShowCurrent((value) => !value)} fieldName='current credential' />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New password</Label>
                                    <div className="relative">
                                        <Input
                                            id="new-password"
                                            type={showNew ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(event) => setNewPassword(event.target.value)}
                                            autoComplete="new-password"
                                            aria-describedby="password-requirements password-reuse-error"
                                            className="h-12 pr-11"
                                            required
                                        />
                                        <VisibilityButton visible={showNew} onToggle={() => setShowNew((value) => !value)} fieldName="new password" />
                                    </div>
                                    {reusesTemporaryPassword && (
                                        <p id="password-reuse-error" className="text-sm text-red-600">New password must be different from the temporary password.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm new password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm-password"
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            autoComplete="new-password"
                                            aria-invalid={Boolean(confirmPassword) && !passwordsMatch}
                                            aria-describedby="password-match-error"
                                            className="h-12 pr-11"
                                            required
                                        />
                                        <VisibilityButton visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} fieldName="password confirmation" />
                                    </div>
                                    {confirmPassword && !passwordsMatch && (
                                        <p id="password-match-error" className="text-sm text-red-600">Passwords do not match.</p>
                                    )}
                                </div>

                                <div id="password-requirements" className="rounded-2xl bg-[#f3f7f5] p-4">
                                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                        <KeyRound className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                                        Password requirements
                                    </p>
                                    <ul className="grid gap-2 text-sm sm:grid-cols-2">
                                        {requirementState.map((requirement) => (
                                            <li key={requirement.label} className={`flex items-center gap-2 ${requirement.met ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                <span className={`grid h-4 w-4 place-items-center rounded-full border ${requirement.met ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                                                    {requirement.met && <Check className="h-3 w-3" aria-hidden="true" />}
                                                </span>
                                                {requirement.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                                {status && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p>}

                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="h-12 w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                                >
                                    <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                                    {isSubmitting ? 'Changing password…' : 'Change password'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={isSubmitting}
                                    onClick={() => logout()}
                                    className="h-11 w-full text-slate-600 hover:text-slate-900"
                                >
                                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Log out instead
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
