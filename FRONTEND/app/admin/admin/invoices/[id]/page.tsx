"use client"

import { use } from "react"
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView"

export default function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <InvoiceDetailView id={id} backUrl="/admin/admin/invoices" />
}
