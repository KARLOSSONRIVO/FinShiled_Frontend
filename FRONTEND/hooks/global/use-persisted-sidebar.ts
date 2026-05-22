"use client"

import { useState, useEffect, useCallback } from "react"

export function usePersistedSidebar(storageKey = "finshield_sidebar_collapsed") {
    const [collapsed, setCollapsedState] = useState(true)

    useEffect(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved !== null) {
            setCollapsedState(saved === "true")
        } else {
            // Default to open on desktop, collapsed on mobile
            setCollapsedState(window.innerWidth < 768)
        }
    }, [storageKey])

    const setCollapsed = useCallback((value: boolean) => {
        setCollapsedState(value)
        localStorage.setItem(storageKey, String(value))
    }, [storageKey])

    return [collapsed, setCollapsed] as const
}
