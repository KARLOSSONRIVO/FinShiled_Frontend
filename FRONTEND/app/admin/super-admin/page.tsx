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
  const [company, setCompany] = useState("all")

  const {
    companiesCount,
    totalUsers,
    totalInvoices,
    totalValue,
    flaggedCount,
    invoices,
    loading,
  } = useSuperAdminDashboard({ enabled: shouldFetch })

  // Company rows always from full dataset — drives the dropdown list
  const companyRows = useMemo(
    () => groupInvoicesByKey(invoices, "companyName"),
    [invoices]
  )
  const companyNames = useMemo(
    () => companyRows.map((r) => r.name).filter((n) => n !== "Unknown"),
    [companyRows]
  )

  // When a company is selected, filter the invoice array for the charts
  const displayInvoices = useMemo(
    () => company === "all" ? invoices : invoices.filter((inv: any) => inv.companyName === company),
    [invoices, company]
  )

  // Chart data derived from filtered invoices
  const riskData = useMemo(
    () => groupInvoicesByPeriod(displayInvoices, period),
    [displayInvoices, period]
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
            <p className="text-muted-foreground">Full Platform Overview and Status</p>
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
              value={totalInvoices}
              icon={FileText}
              description={`₱${totalValue.toLocaleString()} total value`}
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
              value={flaggedCount}
              icon={AlertTriangle}
              description="Needs attention"
            />
          </div>

          {/* Charts + Details Section */}
          <div className="space-y-3">
            <DashboardChartFilters
              period={period}
              onPeriodChange={setPeriod}
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