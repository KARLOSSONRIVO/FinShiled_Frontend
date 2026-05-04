"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/hooks/global/use-auth"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Building2, FileText, AlertTriangle, CheckCircle } from "lucide-react"

import { useSuperAdminDashboard } from "@/hooks/super-admin/use-super-admin-dashboard"
import { DashboardContentSkeleton } from "@/components/skeletons/dashboard-content-skeleton"

import { InvoiceRiskGraph } from "@/components/dashboard/charts/InvoiceRiskGraph"
import { ApprovalRateDonut } from "@/components/dashboard/charts/ApprovalRateDonut"
import { DashboardChartFilters } from "@/components/dashboard/charts/DashboardChartFilters"
import { CompanyBreakdownTable } from "@/components/dashboard/charts/CompanyBreakdownTable"
import { TopRiskInvoices } from "@/components/dashboard/charts/TopRiskInvoices"
import {
  groupInvoicesByPeriod,
  computeApprovalRate,
  groupInvoicesByKey,
  type Period,
} from "@/lib/chart-utils"

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const shouldFetch = !user?.mustChangePassword
  const [period, setPeriod] = useState<Period>("weekly")
  const [dateRange, setDateRange] = useState<string>("1")
  const [company, setCompany] = useState("all")

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    if (p === "weekly") setDateRange("1")
    else if (p === "monthly") setDateRange("6")
    else if (p === "yearly") setDateRange("all")
  }

  const {
    companiesCount,
    totalUsers,
    totalInvoices,
    totalValue,
    flaggedCount,
    invoices,
    loading,
  } = useSuperAdminDashboard({ enabled: shouldFetch })

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    invoices.forEach((inv: any) => {
      const raw = inv.blockchain?.anchoredAt || inv.anchoredAt || inv.createdAt || inv.uploadedAt || inv.invoiceDate || inv.date
      if (raw) {
        const d = new Date(raw)
        if (!isNaN(d.getTime())) years.add(d.getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [invoices])

  const periodInvoices = useMemo(() => {
    const now = new Date()

    return invoices.filter((inv: any) => {
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
  }, [invoices, period, dateRange])

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

  // Company rows always from full dataset — drives the dropdown list
  const allCompanyRows = useMemo(
    () => groupInvoicesByKey(invoices, "companyName"),
    [invoices]
  )
  const companyNames = useMemo(
    () => allCompanyRows.map((r) => r.name).filter((n) => n !== "Unknown"),
    [allCompanyRows]
  )

  const companyRows = useMemo(
    () => groupInvoicesByKey(periodInvoices, "companyName"),
    [periodInvoices]
  )

  // When a company is selected, filter the period invoice array for the charts
  const displayInvoices = useMemo(
    () => company === "all" ? periodInvoices : periodInvoices.filter((inv: any) => inv.companyName === company),
    [periodInvoices, company]
  )

  // Chart data derived from filtered invoices
  const riskData = useMemo(
    () => groupInvoicesByPeriod(displayInvoices, period, dateRange),
    [displayInvoices, period, dateRange]
  )
  const approvalData = useMemo(
    () => computeApprovalRate(displayInvoices),
    [displayInvoices]
  )

  const isCompanySelected = company !== "all"

  if (!shouldFetch) {
    return null
  }

  return (
    <>
      {loading ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          {/* Welcome Message */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.username || "Superadmin"}</span>
            </h2>
            <p className="text-muted-foreground">
              Full Platform Overview{" "}
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Companies"
              value={companiesCount}
              icon={Building2}
              description="Active Organizations"
            />
            <StatsCard
              title="Total Invoices"
              value={periodInvoicesCount}
              icon={FileText}
              description={`₱${periodTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total value`}
            />
            <StatsCard
              title="Verified Users"
              value={totalUsers}
              icon={CheckCircle}
              description="Across all organizations"
              className="text-foreground"
            />
            <StatsCard
              title="Flagged / Alert"
              value={periodFlaggedCount}
              icon={AlertTriangle}
              description="Needs attention"
            />
          </div>

          {/* Charts + Details Section */}
          <div className="space-y-3">
            <DashboardChartFilters
              period={period}
              onPeriodChange={handlePeriodChange}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              availableYears={availableYears}
              showCompanyFilter
              company={company}
              onCompanyChange={setCompany}
              companies={companyNames}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left col-span-2: both charts stacked */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <InvoiceRiskGraph
                  data={riskData}
                  title={isCompanySelected ? `${company} — Invoice Risk` : "Invoice Risk Graph"}
                />
                <ApprovalRateDonut
                  data={approvalData}
                  title={isCompanySelected ? `${company} — Approval Rate` : "Auditor Approval Rate"}
                />
              </div>

              {/* Right col-span-1: switches based on company selection */}
              <div className="lg:col-span-1">
                {isCompanySelected ? (
                  <TopRiskInvoices
                    invoices={displayInvoices}
                    title={`${company} — Top Risks`}
                    emptyMessage="No risk data for this company"
                  />
                ) : (
                  <CompanyBreakdownTable
                    rows={companyRows}
                    title="Company Performance"
                    icon="building"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}