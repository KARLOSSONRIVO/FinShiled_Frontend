"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users } from "lucide-react"
import type { GroupedRow } from "@/lib/chart-utils"

// MongoDB ObjectIds are 24 hex characters — the API returns uploadedBy as an ID, not a name.
// When we have no name mapping, display a truncated ID instead of a raw 24-char string.
function isObjectId(value: string): boolean {
    return /^[a-f0-9]{24}$/i.test(value)
}

function formatName(name: string): { display: string; isId: boolean } {
    if (isObjectId(name)) {
        return { display: `ID: ${name.slice(0, 8)}…`, isId: true }
    }
    return { display: name, isId: false }
}

interface CompanyBreakdownTableProps {
    rows: GroupedRow[]
    title?: string
    /** Show a % clean column instead of raw clean count */
    showCleanPercent?: boolean
    /** Icon to show in the header — defaults to Building2 */
    icon?: "building" | "users"
    emptyMessage?: string
}

const MAX_ROWS = 8

export function CompanyBreakdownTable({
    rows,
    title = "Company Performance",
    showCleanPercent = false,
    icon = "building",
    emptyMessage = "No data available",
}: CompanyBreakdownTableProps) {
    const Icon = icon === "users" ? Users : Building2
    const visible = rows.slice(0, MAX_ROWS)

    return (
        <Card className="h-full border border-border/50 shadow-sm flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 flex-1 overflow-hidden">
                {visible.length === 0 ? (
                    <div className="flex h-full min-h-[160px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-0 overflow-y-auto max-h-[340px] pr-1">
                        {/* Header row */}
                        <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border/40">
                            <span className="col-span-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Name
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-center">
                                Total
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
                                {showCleanPercent ? "% Clean" : "Flagged"}
                            </span>
                        </div>

                        {/* Data rows */}
                        {visible.map((row, idx) => {
                            const cleanPct =
                                row.total > 0 ? Math.round((row.clean / row.total) * 100) : 0

                            const { display, isId } = formatName(row.name)

                            return (
                                <div
                                    key={row.name}
                                    className="grid grid-cols-4 gap-2 py-2.5 border-b border-border/20 last:border-0 items-center"
                                >
                                    {/* Name + rank */}
                                    <div className="col-span-2 flex items-center gap-2 min-w-0">
                                        <span className="text-[10px] text-muted-foreground/50 w-4 shrink-0 font-mono">
                                            {idx + 1}
                                        </span>
                                        <span
                                            className={`text-xs font-medium truncate ${
                                                isId
                                                    ? "text-muted-foreground font-mono"
                                                    : "text-foreground"
                                            }`}
                                            title={row.name}
                                        >
                                            {display}
                                        </span>
                                    </div>

                                    {/* Total */}
                                    <span className="text-xs font-semibold text-foreground text-center">
                                        {row.total}
                                    </span>

                                    {/* Clean % or Flagged count */}
                                    <div className="flex flex-col items-end gap-0.5">
                                        {showCleanPercent ? (
                                            <>
                                                <span
                                                    className={`text-xs font-semibold ${
                                                        cleanPct >= 80
                                                            ? "text-emerald-500"
                                                            : cleanPct >= 50
                                                            ? "text-amber-500"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {cleanPct}%
                                                </span>
                                                {/* Mini progress bar */}
                                                <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            cleanPct >= 80
                                                                ? "bg-emerald-500"
                                                                : cleanPct >= 50
                                                                ? "bg-amber-500"
                                                                : "bg-red-500"
                                                        }`}
                                                        style={{ width: `${cleanPct}%` }}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <span
                                                className={`text-xs font-semibold ${
                                                    row.flagged === 0
                                                        ? "text-emerald-500"
                                                        : row.flagged <= 2
                                                        ? "text-amber-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {row.flagged}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {rows.length > MAX_ROWS && (
                            <p className="pt-2 text-center text-[10px] text-muted-foreground">
                                +{rows.length - MAX_ROWS} more
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
