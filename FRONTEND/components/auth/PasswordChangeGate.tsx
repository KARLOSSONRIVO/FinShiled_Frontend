'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useAuthContext } from '@/providers/auth-provider'

const CHANGE_PASSWORD_PATH = '/change-temporary-password'

export function PasswordChangeGate({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, isLoading } = useAuthContext()
    const requiresChange = Boolean(user?.mustChangePassword)
    const isChangePage = pathname === CHANGE_PASSWORD_PATH

    useEffect(() => {
        if (!isLoading && requiresChange && !isChangePage) {
            router.replace(CHANGE_PASSWORD_PATH)
        }
    }, [isChangePage, isLoading, requiresChange, router])

    if (isLoading || (requiresChange && !isChangePage)) {
        return (
            <main
                role="status"
                aria-live="polite"
                className="grid min-h-screen place-items-center bg-[#f5f5f0] px-6"
            >
                <div className="flex items-center gap-3 text-[#17201d]">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100">
                        <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-semibold">Securing your account</p>
                        <p className="text-sm text-slate-600">Preparing the required password change…</p>
                    </div>
                </div>
            </main>
        )
    }

    return children
}
