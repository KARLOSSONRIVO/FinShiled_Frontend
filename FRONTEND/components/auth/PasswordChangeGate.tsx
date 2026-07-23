'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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

    // Only block rendering if the user needs to change their password
    // and hasn't navigated to the change page yet.
    // Do NOT block on isLoading — that caused a loading flash for all users on every refresh.
    if (requiresChange && !isChangePage) {
        return null // redirect is already firing from useEffect above
    }

    return children
}
