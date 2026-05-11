"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react"

interface RiskAnalysisProps {
    averageRiskScore: number
    verifiedCount: number
    flaggedCount: number
    fraudRate: number
    fraudCount: number
    totalInvoices: number
}

function getRiskLevel(score: number): { color: string; label: string; description: string } {
    if (score >= 70) return { color: "#ef4444", label: "High Risk",   description: "Significant anomalies detected. Immediate review is recommended across flagged invoices." }
    if (score >= 40) return { color: "#f97316", label: "Medium Risk", description: "Some irregular patterns were found. Closer manual inspection is advised for flagged items." }
    return              { color: "#10b981", label: "Low Risk",    description: "Invoice portfolio appears healthy. AI detected minimal anomalies — no immediate action needed." }
}

/** Full-width SVG semicircle gauge — no Recharts, no wasted space */
function GaugeMeter({ score, color }: { score: number; color: string }) {
    // viewBox 200×100: center at (100,100), arc sweeps the full 200px width
    const cx = 100, cy = 100
    const R = 94, r = 64  // outer / inner radius (thickness = 30)
    const toRad = (deg: number) => (deg * Math.PI) / 180

    const angle  = (score / 100) * 180   // degrees swept, 0-180
    const endDeg = 180 - angle            // angle from +X axis (standard math coords)

    const ex  = cx + R * Math.cos(toRad(endDeg))
    const ey  = cy - R * Math.sin(toRad(endDeg))
    const ex2 = cx + r * Math.cos(toRad(endDeg))
    const ey2 = cy - r * Math.sin(toRad(endDeg))
    const large = angle > 90 ? 1 : 0

    // Full track (entire grey semicircle)
    const track = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx - r} ${cy} Z`

    // Coloured filled arc (score portion)
    const filled = score <= 0
        ? null
        : score >= 100
        ? track
        : `M ${cx - R} ${cy} A ${R} ${R} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)} L ${ex2.toFixed(2)} ${ey2.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${cx - r} ${cy} Z`

    return (
        <svg viewBox="0 0 200 100" width="100%" style={{ display: "block" }}>
            <path d={track} fill="hsl(var(--muted))" />
            {filled && <path d={filled} fill={color} />}
        </svg>
    )
}

export function RiskAnalysis({
    averageRiskScore,
    verifiedCount,
    flaggedCount,
    fraudRate,
    fraudCount,
    totalInvoices,
}: RiskAnalysisProps) {
    const score = Math.min(100, Math.max(0, averageRiskScore))
    const risk = getRiskLevel(score)

    return (
        <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    AI Risk Analysis
                </CardTitle>
                <CardDescription>Automated anomaly detection results across all invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* ── Gauge ── */}
                <div className="flex justify-center pt-2 pb-6">
                    <div className="relative w-64">
                        <GaugeMeter score={score} color={risk.color} />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 flex flex-col items-center w-full">
                            <span className="text-5xl font-black leading-none tracking-tight" style={{ color: risk.color }}>
                                {score.toFixed(0)}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">out of 100</span>
                            <span
                                className="rounded-full px-3 py-0.5 mt-1.5 text-[11px] font-bold tracking-wide text-white shadow-sm"
                                style={{ background: risk.color }}
                            >
                                {risk.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Explanation banner ── */}
                <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 bg-muted/40 border border-border/40">
                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{risk.description}</p>
                </div>

                {/* ── AI verdict cards ── */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-5 py-4 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Cleared</span>
                        </div>
                        <span className="text-4xl font-black text-emerald-700 dark:text-emerald-300 leading-none">{verifiedCount}</span>
                        <span className="text-xs text-emerald-600/80 dark:text-emerald-400/70 leading-snug">
                            Invoices with no anomalies detected by AI
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 px-5 py-4 border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">AI Flagged</span>
                        </div>
                        <span className="text-4xl font-black text-amber-700 dark:text-amber-300 leading-none">{flaggedCount}</span>
                        <span className="text-xs text-amber-600/80 dark:text-amber-400/70 leading-snug">
                            Require human review before approval
                        </span>
                    </div>
                </div>

                {/* ── Fraud detection rate ── */}
                <div className="rounded-xl border border-border/50 px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Fraud Detection Rate</span>
                        <span className="text-xl font-black" style={{ color: risk.color }}>{fraudRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-2.5 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(fraudRate, 100)}%`, background: risk.color }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {fraudCount} of {totalInvoices} invoice{totalInvoices !== 1 ? "s" : ""} flagged as potentially fraudulent.{" "}
                        <span className="font-medium">
                            {fraudRate < 10 ? "Well within acceptable thresholds." : fraudRate < 30 ? "Monitor closely." : "Action required."}
                        </span>
                    </p>
                </div>

            </CardContent>
        </Card>
    )
}

