export * from "./user"
export * from "./organization"
export * from "./invoice"
export * from "./primitives"

import { User } from "./user"
import { Organization } from "./organization"
import {
    AssignmentStatus,
    ReviewDecision,
    EntityType,
    StatusFilter,
    AiVerdictFilter
} from "./primitives"

export type { StatusFilter, AiVerdictFilter }

// ─── Aggregate Types ─────────────────────────────────────────────────────────

export interface CompanyAssignment {
    id: string
    _id?: string  // alias kept for backward compatibility
    auditorOrgId: string
    companyOrgId: string
    status: AssignmentStatus
    auditorUserId?: string
    assignedByUserId?: string
    assignedAt?: string
    createdAt?: string
    updatedAt?: string
    // Populated fields
    company?: Partial<Organization>
    auditor?: Partial<User>
    assignedBy?: Partial<User>
    notes?: string
    taskName?: string
    dueDate?: string
}

export interface Review {
    _id: string
    invoiceId: string
    companyOrgId: string
    reviewedByUserId: string
    decision: ReviewDecision
    notes?: string
    createdAt: string
    reviewerName?: string
}

export enum AuditActions {
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILURE = "LOGIN_FAILURE",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    LOGOUT = "LOGOUT",
    MFA_ENABLED = "MFA_ENABLED",
    MFA_DISABLED = "MFA_DISABLED",
    MFA_AUTO_ENABLED = "MFA_AUTO_ENABLED",
    MFA_EMAIL_CODE_REQUESTED = "MFA_EMAIL_CODE_REQUESTED",
    MFA_EMAIL_VERIFIED = "MFA_EMAIL_VERIFIED",
    MFA_EMAIL_VERIFICATION_FAILED = "MFA_EMAIL_VERIFICATION_FAILED",
    MFA_AUTHENTICATOR_SETUP_STARTED = "MFA_AUTHENTICATOR_SETUP_STARTED",
    MFA_AUTHENTICATOR_ENABLED = "MFA_AUTHENTICATOR_ENABLED",
    MFA_AUTHENTICATOR_VERIFIED = "MFA_AUTHENTICATOR_VERIFIED",
    MFA_AUTHENTICATOR_FAILED = "MFA_AUTHENTICATOR_FAILED",
    MFA_AUTHENTICATOR_REMOVED = "MFA_AUTHENTICATOR_REMOVED",
    MFA_AUTHENTICATOR_REPLACED = "MFA_AUTHENTICATOR_REPLACED",
    MFA_PREFERRED_METHOD_CHANGED = "MFA_PREFERRED_METHOD_CHANGED",
    MFA_ADMIN_AUTHENTICATOR_RESET = "MFA_ADMIN_AUTHENTICATOR_RESET",
    MFA_EXCESSIVE_ATTEMPTS = "MFA_EXCESSIVE_ATTEMPTS",
    USER_CREATED = "USER_CREATED",
    USER_UPDATED = "USER_UPDATED",
    USER_DISABLED = "USER_DISABLED",
    USER_ENABLED = "USER_ENABLED",
    WELCOME_EMAIL_SENT = "WELCOME_EMAIL_SENT",
    WELCOME_EMAIL_FAILED = "WELCOME_EMAIL_FAILED",
    PASSWORD_RESET_FORCED = "PASSWORD_RESET_FORCED",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    FORCED_PASSWORD_CHANGE_COMPLETED = "FORCED_PASSWORD_CHANGE_COMPLETED",
    USER_ROLE_CHANGED = "USER_ROLE_CHANGED",
    SYSTEM_ADMIN_CREATED = "SYSTEM_ADMIN_CREATED",
    SYSTEM_ADMIN_ENABLED = "SYSTEM_ADMIN_ENABLED",
    SYSTEM_ADMIN_DISABLED = "SYSTEM_ADMIN_DISABLED",
    SYSTEM_ADMIN_ACCESS_RESET = "SYSTEM_ADMIN_ACCESS_RESET",
    ORG_CREATED = "ORG_CREATED",
    ORG_UPDATED = "ORG_UPDATED",
    ORG_TEMPLATE_UPLOADED = "ORG_TEMPLATE_UPLOADED",
    ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED",
    ASSIGNMENT_UPDATED = "ASSIGNMENT_UPDATED",
    ASSIGNMENT_DELETED = "ASSIGNMENT_DELETED",
    INVOICE_UPLOADED = "INVOICE_UPLOADED",
    INVOICE_FLAGGED = "INVOICE_FLAGGED",
    REVIEW_SUBMITTED = "REVIEW_SUBMITTED",
    REVIEW_UPDATED = "REVIEW_UPDATED",
    ARCHIVE_EXECUTED = "ARCHIVE_EXECUTED",
    ARCHIVE_ACCESSED = "ARCHIVE_ACCESSED",
    POLICY_CREATED = "POLICY_CREATED",
    POLICY_UPDATED = "POLICY_UPDATED",
    POLICY_DELETED = "POLICY_DELETED",
    TERMS_CREATED = "TERMS_CREATED",
    TERMS_UPDATED = "TERMS_UPDATED",
    TERMS_DELETED = "TERMS_DELETED",
    PLATFORM_CONFIGURATION_CHANGED = "PLATFORM_CONFIGURATION_CHANGED",
    MAINTENANCE_MODE_CHANGED = "MAINTENANCE_MODE_CHANGED"
}

export interface AuditLocation {
    display: string;
    city: string | null;
    region: string | null;
    country: string | null;
    countryCode: string | null;
    timezone: string | null;
    lookupStatus: "RESOLVED" | "PRIVATE_IP" | "LOCAL_ENVIRONMENT" | "UNAVAILABLE" | "LOOKUP_FAILED" | "NOT_REQUESTED";
    resolvedAt: string | null;
}

export interface AuditLog {
    id: string;
    _id?: string; // for backward compatibility
    actorId: string | null;
    actorRole: string | null;
    actor: {
        username: string | null;
        email: string | null;
    };
    action: AuditActions | string;
    targetType?: string;
    targetId?: string | null;
    organizationId?: string | null;
    target?: {
        type: string;
        id?: string;
    };
    summary: string;
    metadata: Record<string, any>;
    ipAddress: string | null;
    ip: string | null;
    location: AuditLocation;
    userAgent: string | null;
    requestId: string | null;
    outcome: "SUCCESS" | "FAILURE" | "UNKNOWN";
    failureReason: string | null;
    isArchived: boolean;
    archivedAt: string | null;
    archiveKey: string | null;
    archiveFileHash: string | null;
    createdAt: string;
}

import { PaginationQuery } from "./primitives"

export interface AuditLogQuery extends PaginationQuery {
    action?: AuditActions | string;
    actorRole?: string;
    from?: string; // ISO date string
    to?: string;   // ISO date string
    location?: string;
    countryCode?: string;
    sortBy?: "createdAt" | "action" | "actorRole" | "country";
    order?: "asc" | "desc";
}

export interface AuditLogPage {
    items: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
