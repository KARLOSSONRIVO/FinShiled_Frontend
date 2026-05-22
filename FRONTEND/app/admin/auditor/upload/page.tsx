"use client"
 
import { UploadInvoiceForm } from "@/components/invoices/UploadInvoiceForm"
 
export default function AuditorUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Upload Invoice
        </h1>
      </div>
 
      <div className="w-full">
        <UploadInvoiceForm />
      </div>
    </div>
  )
}
