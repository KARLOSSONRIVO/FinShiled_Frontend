# Services — Documentation

The `services/` layer is the **only place in the app that makes direct API calls**.
All functions use the shared `apiClient` (Axios instance with auth interceptors) from `lib/api-client.ts`.

## Pattern

Every service is a plain object with async methods. No classes, no singletons.

```ts
export const MyService = {
  doSomething: async (params: Params): Promise<Response> => {
    const { data } = await apiClient.get("/endpoint", { params })
    return data
  }
}
```

## Services Index

| File | API Prefix | Roles |
|------|-----------|-------|
| [auth.service.md](./auth.service.md) | `/auth` | All |
| [invoice.service.md](./invoice.service.md) | `/invoice` | All (scoped by role server-side) |
| [dashboard.service.md](./dashboard.service.md) | `/dashboard` | All (role-specific endpoints) |
| [organization.service.md](./organization.service.md) | `/organization` | SUPER_ADMIN, ADMIN, COMPANY_MANAGER |
| [user.service.md](./user.service.md) | `/user` | SUPER_ADMIN, ADMIN, COMPANY_MANAGER |
| [assignment.service.md](./assignment.service.md) | `/assignment` | SUPER_ADMIN, ADMIN |
| [audit.service.md](./audit.service.md) | `/audit` | AUDITOR, SUPER_ADMIN |
| [blockchain.service.md](./blockchain.service.md) | `/blockchain` | SUPER_ADMIN, COMPANY_MANAGER |
| [policy.service.md](./policy.service.md) | `/policy` | SUPER_ADMIN, ADMIN, REGULATOR |
| [session.service.md](./session.service.md) | `/session` | All |
| [terms.service.md](./terms.service.md) | `/terms` | All |

## Shared Types

All services import types from `@/lib/types`. See [lib/types.md](../lib/types.md) for full type reference.

## Error Handling

Services generally **let errors bubble up** to the calling hook.
The `invoice.service.ts` is the exception — it contains a `fallbackList` mechanism for auditor role edge cases.
See [invoice.service.md](./invoice.service.md) for details.
