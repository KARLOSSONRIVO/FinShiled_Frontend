"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/hooks/global/use-auth"
import { ManagerStats } from "@/components/dashboard/ManagerStats"
import { useManagerDashboard } from "@/hooks/company-manager/dashboard/use-manager-dashboard"
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

export default function CompanyManagerDashboard() {
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

  const {
    employeeCount,
    allInvoices,
    isLoading,
  } = useManagerDashboard({ enabled: shouldFetch })

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    allInvoices.forEach((inv: any) => {
      const raw = inv.blockchain?.anchoredAt || inv.anchoredAt || inv.createdAt || inv.uploadedAt || inv.invoiceDate || inv.date
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
      const raw = inv.blockchain?.anchoredAt || inv.anchoredAt || inv.createdAt || inv.uploadedAt || inv.invoiceDate || inv.date
      if (!raw) return false
      const d = new Date(raw)
      if (isNaN(d.getTime())) return false

      if (period === "weekly") {
        const weeks = parseInt(dateRange) || 1
        const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
        return daysAgo >= 0 && daysAgo <= (weeks * 7)
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

  const { periodInvoicesCount, periodFlaggedCount, periodTotalValue } = useMemo(() => {
    const flaggedCount = periodInvoices.filter(
      (i: any) => i.status === "flagged" || i.aiVerdict?.verdict === "flagged"
    ).length
    const totalValue = periodInvoices.reduce(
      (sum: number, inv: any) => sum + (Number(inv.amount || inv.totalAmount) || 0),
      0
    )

    return {
      periodInvoicesCount: periodInvoices.length,
      periodFlaggedCount: flaggedCount,
      periodTotalValue: totalValue,
    }
  }, [periodInvoices])

  if (!shouldFetch) {
    return null
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.username || "Manager"}</span>
            </h2>
            <p className="text-muted-foreground">
              Here's what's happening with your invoices{" "}
              {period === "weekly" ? (
                <span className="text-primary font-medium">
                  {dateRange === "1" ? "the past week" : `the past ${dateRange} weeks`}
                </span>
              ) : period === "monthly" ? (
                <span className="text-primary font-medium">
                  {dateRange === "1" ? "the past month" : `these past ${dateRange} months`}
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

          <ManagerStats
            totalInvoices={periodInvoicesCount}
            flaggedCount={periodFlaggedCount}
            employeeCount={employeeCount}
            totalValue={periodTotalValue}
          />

          {/* Charts + Details Section */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left col-span-2: both charts stacked */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <InvoiceRiskGraph
                  data={riskData}
                  title="Invoice Risk Graph"
                />
                <ApprovalRateDonut
                  data={approvalData}
                  title="Team Approval Rate"
                />
              </div>
              {/* Right col-span-1: top risk invoices */}
              <div className="lg:col-span-1">
                <TopRiskInvoices
                  invoices={periodInvoices}
                  title="Top Risk Invoices"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}