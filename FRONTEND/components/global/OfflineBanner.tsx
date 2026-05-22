"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false)
    const [showOnlineAlert, setShowOnlineAlert] = useState(false)

    useEffect(() => {
        const handleOffline = () => {
            setIsOffline(true)
            setShowOnlineAlert(false)
        }
        const handleOnline = () => {
            setIsOffline(false)
            setShowOnlineAlert(true)
            const timer = setTimeout(() => {
                setShowOnlineAlert(false)
            }, 4000)
            return () => clearTimeout(timer)
        }

        if (typeof window !== "undefined") {
            setIsOffline(!window.navigator.onLine)
            window.addEventListener("offline", handleOffline)
            window.addEventListener("online", handleOnline)
        }

        return () => {
            window.removeEventListener("offline", handleOffline)
            window.removeEventListener("online", handleOnline)
        }
    }, [])

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
                >
                    <div className="bg-destructive/95 backdrop-blur-md border border-destructive/20 text-destructive-foreground shadow-2xl rounded-2xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl animate-pulse">
                            <WifiOff className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">Offline Mode</h4>
                            <p className="text-xs opacity-90">Viewing cached read-only data. Changes will sync when online.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {showOnlineAlert && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
                >
                    <div className="bg-emerald-600/95 backdrop-blur-md border border-emerald-500/20 text-white shadow-2xl rounded-2xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Wifi className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">Reconnected</h4>
                            <p className="text-xs opacity-90">Refreshing dashboard data...</p>
                        </div>
                        <button
                            onClick={() => setShowOnlineAlert(false)}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
