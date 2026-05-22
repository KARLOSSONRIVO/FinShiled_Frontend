"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { useState, useEffect } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes (offline-friendly balance)
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
            },
        },
    }))

    const [persister, setPersister] = useState<any>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const p = createSyncStoragePersister({
                storage: window.localStorage,
                key: "FINSHIELD_QUERY_CACHE",
            })
            setPersister(p)
        }
    }, [])

    if (!persister) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => {
                        // Whitelist only public, low-sensitivity metadata queries
                        const key = query.queryKey[0]
                        return key === "terms" || key === "sidebar-prefs" || key === "user-theme"
                    }
                }
            }}
        >
            {children}
        </PersistQueryClientProvider>
    )
}
