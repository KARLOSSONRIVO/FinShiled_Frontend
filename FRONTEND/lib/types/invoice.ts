import { components } from "../api-types";
import { AIVerdict, InvoiceStatus, ReviewDecision } from "./primitives";

/** Base schema type for Invoice */
export type BaseInvoice = components["schemas"]["Invoice"];

export interface ListInvoice {
    id: string
    _id?: string
    invoiceNumber: string
    invoiceNo?: string
    date?: string
    invoiceDate?: string
    amount?: number
    totalAmount?: number
    totals_total?: number
    aiVerdict?: {
        verdict: AIVerdict
        riskScore: number
    }
    ai_verdict?: AIVerdict
    ai_riskScore?: number
    status: InvoiceStatus
    blockchain?: string
    companyName?: string
    uploadedByName?: string
    createdAt?: string
    uploadedAt?: string
    reviewDecision?: string
}

export interface MyInvoice {
    id: string
    _id?: string
    invoiceNumber: string
    date?: string
    amount?: number
    fileName?: string
    status: InvoiceStatus
    anchorStatus?: string
    uploadedAt?: string
}

export interface InvoiceDetail {
    id: string
    _id?: string
    invoiceNumber: string
    company?: string
    invoiceDate?: string
    totalAmount?: number
    status: InvoiceStatus
    imageUrl?: string
    originalFileName?: string
    aiAnalysis?: {
        verdict: AIVerdict
        riskScore: number
        summary?: string
    }
    blockchain?: {
        txHash: string
        anchoredAt: string
        ipfsCid?: string
        fileUrl?: string
    }
    review?: {
        reviewer: string
        decision: ReviewDecision
        notes?: string
        reviewedAt: string
    }
}

export interface ReviewPayload {
    reviewDecision: ReviewDecision
    reviewNotes: string
}

export interface ReviewResponse {
    invoiceId: string
    reviewDecision: ReviewDecision
    reviewNotes: string
    reviewedAt: string
    isUpdate: boolean
}

export interface BlockchainTransaction {
    id: string
    _id?: string
    invoiceReference: string
    invoiceNumber: string
    organization: string
    company: string
    transactionHash: string
    blockNumber?: number | null
    network?: string
    transactionStatus?: string
    submittedDate?: string | null
    confirmedDate?: string | null
    submittedBy?: string | null
    anchoredAt: string
    status: string
    technical?: {
        errorCode?: string | null
        retrySupported?: boolean
    }
}

/** The primary Invoice type used in the frontend (aliased to ListInvoice) */
export interface Invoice extends ListInvoice { }
