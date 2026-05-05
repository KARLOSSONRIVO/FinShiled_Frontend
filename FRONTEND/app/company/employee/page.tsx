"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/hooks/global/use-auth"
import EmployeeStats from "@/components/dashboard/EmployeeStats"
import { useEmployeeDashboard } from "@/hooks/company-employee/dashboard/use-employee-dashboard"
import { DashboardContentSkeleton } from "@/components/skeletons/dashboard-content-skeleton"

import { InvoiceRiskGraph } from "@/components/dashboard/charts/InvoiceRiskGraph"
import { ApprovalRateDonut } from "@/components/dashboard/charts/ApprovalRateDonut"
import { DashboardChartFilters } from "@/components/dashboard/charts/DashboardChartFilters"
import { TopRiskInvoices } from "@/components/dashboard/charts/TopRiskInvoices"
import {
  groupInvoicesByPeriod,
  computeApprovalRate,
  type Period,
} from "@/lib/chart-utils"

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const shouldFetch = !user?.mustChangePassword
  const [period, setPeriod] = useState<Period>("weekly")
  const [dateRange, setDateRange] = useState<string>("1")

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    if (p === "weekly") setDateRange("1")
    else if (p === "monthly") setDateRange("6")
    else if (p === "yearly") setDateRange("all")
  }

  const { allInvoices, isLoading } = useEmployeeDashboard({ enabled: shouldFetch })

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    allInvoices.forEach((inv: any) => {
      const raw = inv.uploadedAt || inv.date || inv.invoiceDate || inv.createdAt
      if (raw) {
        const d = new Date(raw)
        if (!isNaN(d.getTime())) years.add(d.getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [allInvoices])

  const periodInvoices = useMemo(() => {
    const now = new Date()
    return allInvoices.filter((inv: any) => {
      const raw = inv.uploadedAt || inv.date || inv.invoiceDate || inv.createdAt
      if (!raw) return false
      const d = new Date(raw)
      if (isNaN(d.getTime())) return false

      if (period === "weekly") {
        const weeks = parseInt(dateRange) || 1
        const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
        return daysAgo >= 0 && daysAgo <= weeks * 7
      } else if (period === "monthly") {
        const months = parseInt(dateRange) || 6
        const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
        return monthDiff >= 0 && monthDiff < months
      } else if (period === "yearly") {
        if (dateRange === "all") return true
        return d.getFullYear() === parseInt(dateRange)
      }
      return false
    })
  }, [allInvoices, period, dateRange])

  const riskData = useMemo(
    () => groupInvoicesByPeriod(periodInvoices, period, dateRange),
    [periodInvoices, period, dateRange]
  )

  const approvalData = useMemo(
    () => computeApprovalRate(periodInvoices),
    [periodInvoices]
  )

  const periodRejected = useMemo(
    () => periodInvoices.filter((i: any) => String(i.status) === "rejected" || String(i.status) === "flagged"),
    [periodInvoices]
  )

  const { periodTotal, periodApproved, periodPending, periodRejectedCount } = useMemo(() => ({
    periodTotal: periodInvoices.length,
    periodApproved: periodInvoices.filter((i: any) =>
      String(i.status) === "approved" || String(i.status) === "clean" || String((i as any).reviewDecision) === "approved"
    ).length,
    periodPending: periodInvoices.filter((i: any) => String(i.status) === "pending").length,
    periodRejectedCount: periodRejected.length,
  }), [periodInvoices, periodRejected])

  if (!shouldFetch) return null

  return (
    <div className="space-y-6 p-6">
      {isLoading ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.username || "Employee"}</span>
            </h2>
            <p className="text-muted-foreground">
              My Invoice Activity{" "}
              {period === "weekly" ? (
                <span className="text-primary font-medium">
                  {dateRange === "1" ? "for the past week" : `for the past ${dateRange} weeks`}
                </span>
              ) : period === "monthly" ? (
                <span className="text-primary font-medium">
                  {dateRange === "1" ? "for the past month" : `for the past ${dateRange} months`}
                </span>
              ) : (
                <span className="text-primary font-medium">
                  {dateRange === "all" ? "across all years" : `in ${dateRange}`}
                </span>
              )}
            </p>
          </div>

          <div className="pt-2">
            <DashboardChartFilters
              period={period}
              onPeriodChange={handlePeriodChange}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              availableYears={availableYears}
            />
          </div>

          <EmployeeStats
            myInvoicesCount={periodTotal}
            pendingCount={periodPending}
            verifiedCount={periodApproved}
            rejectedCount={periodRejectedCount}
          />

          {/* Charts + Details Section */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left col-span-2: both charts stacked */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <InvoiceRiskGraph
                  data={riskData}
                  title="My Invoice Activity"
                />
                <ApprovalRateDonut
                  data={approvalData}
                  title="My Submission Status"
                />
              </div>

              {/* Right col-span-1: My Rejected/Flagged Invoices */}
              <div className="lg:col-span-1">
                <TopRiskInvoices
                  invoices={periodRejected}
                  title="My Rejected / Flagged"
                  emptyMessage="No rejected or flagged invoices — great job!"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}