# FinShield Frontend — Documentation

This folder contains the developer documentation for the FinShield frontend application.

## Stack

| Tech | Purpose |
|------|---------|
| **Next.js 16** | App router, SSR, middleware |
| **React 19** | UI framework |
| **TypeScript 5** | Type safety |
| **TanStack Query v5** | Server state, caching |
| **Axios** | HTTP client with interceptors |
| **Radix UI / ShadCN** | Accessible component primitives |
| **Tailwind CSS v4** | Utility-first styling |
| **Socket.IO** | Real-time notifications |
| **Framer Motion** | Animations |
| **Recharts** | Data visualization |
| **Zod** | Schema validation |
| **Ethers.js** | MetaMask / blockchain integration |

## Documentation Index

| Section | Description |
|---------|-------------|
| [architecture.md](./architecture.md) | System overview, provider tree, invoice lifecycle, data fetching strategy |
| [auth-flow.md](./auth-flow.md) | Login, MFA, session restore, token refresh, logout, route protection |
| [middleware.md](./middleware.md) | Next.js Edge route protection middleware |
| [env-variables.md](./env-variables.md) | All environment variables with setup guide |
| [lib/client/](./lib/client/api-client.md) | Axios instance, interceptors, token refresh queue |
| [lib/types/](./lib/types/types.md) | All shared TypeScript types |
| [lib/utilities/](./lib/utilities/utilities.md) | `cn()`, styling maps, socket event constants |
| [services/auth/](./services/auth/auth.md) | AuthService + sessionService |
| [services/finance/](./services/finance/finance.md) | InvoiceService + DashboardService |
| [services/admin/](./services/admin/admin.md) | OrganizationService, UserService, AssignmentService, policyService |
| [services/compliance/](./services/compliance/compliance.md) | AuditService, blockchainService, termsService |
| [hooks/roles/](./hooks/roles/roles.md) | Role-scoped data hooks (employee, manager, auditor, regulator, admin) |
| [hooks/shared/](./hooks/shared/shared.md) | Shared hooks: auth, socket, filters, upload |
| [providers/state/](./providers/state/state.md) | AuthProvider + QueryProvider |
| [providers/infrastructure/](./providers/infrastructure/infrastructure.md) | SocketProvider, MetaMaskProvider, ThemeProvider, SmoothScrolling |
| [components/core/](./components/core/core.md) | Layout, global listeners, password gate, offline banner |
| [components/auth/](./components/auth/auth.md) | Login, MFA input, password change, MFA settings |
| [components/finance/](./components/finance/finance.md) | Invoice table, filters, detail, dashboard, reports, alerts |
| [components/admin/](./components/admin/admin.md) | Organizations, users, assignments UI |
| [components/compliance/](./components/compliance/compliance.md) | Audit logs, policy, blockchain transactions UI |
| [components/settings/](./components/settings/settings.md) | Appearance, security, profile, sessions, terms |

## Project Structure

```
FRONTEND/
├── app/                    # Next.js App Router pages & layouts
│   ├── admin/              # Admin role routes (Owner, auditor, regulator)
│   ├── company/            # Company role routes (manager, employee)
│   ├── dashboard/          # Dashboard route
│   ├── login/              # Auth pages
│   └── forgot-password/
├── components/             # Reusable UI components
│   ├── ui/                 # ShadCN auto-generated primitives (do not edit)
│   ├── layout/             # TopBar, Sidebar, navigation
│   ├── dashboard/          # Dashboard widgets
│   ├── invoices/           # Invoice list, filters, detail views
│   ├── settings/           # User settings panels
│   └── ...
├── hooks/                  # Custom React hooks (grouped by role)
│   ├── company-employee/
│   ├── company-manager/
│   ├── auditor/
│   ├── regulator/
│   └── ...
├── providers/              # React context providers
├── services/               # API service functions
├── lib/                    # Shared utilities, types, API client
│   └── types/              # TypeScript type definitions
├── styles/                 # Global CSS
├── public/                 # Static assets
├── middleware.ts            # Next.js route protection
└── docs/                   # ← You are here
```

## Comment Style Guide

All source files use **JSDoc/TSDoc** comments for inline documentation.

```ts
/**
 * Brief one-line description.
 *
 * @remarks
 * Longer explanation for non-obvious behavior, edge cases, or role scoping.
 *
 * @param paramName - What this param represents
 * @returns Description of the return value
 *
 * @example
 * const result = myFunction("example")
 */
```

> [!NOTE]
> `lib/api-types.ts` and `components/ui/` are **auto-generated** files.
> Do not add hand-written documentation to them — changes will be overwritten.
