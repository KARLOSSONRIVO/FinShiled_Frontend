# Admin Services

Organization management, user administration, auditor assignments, and compliance policy management.

---

## `OrganizationService` — `services/organization.service.ts`

### Types

```ts
interface CreateOrganizationRequest {
  name: string
  type: 'company' | 'organization'
  invoiceTemplate?: File | string
}

interface UpdateOrganizationRequest {
  name?: string
  status?: 'active' | 'inactive'
  type?: 'company' | 'organization'
  invoiceTemplate?: File | string
}
```

### Methods

#### `createOrganization(data)`
`POST /organization/createOrganization` — Always sends as `multipart/form-data` because `invoiceTemplate` may be a file. The `Content-Type` header is deleted so the browser sets the correct multipart boundary automatically.

#### `listOrganizations(params?)`
`GET /organization/listOrganizations`

Valid `sortBy` values: `createdAt` | `name` | `type`

Returns a `PaginatedResponse<Organization>`.

#### `getOrganization(id)`
`GET /organization/getOrganization/:id` — Returns `{ success, data: Organization }`.

#### `updateOrganization(id, data)`
`PATCH /organization/updateOrganization/:id`

Automatically selects the correct content type:
- If `data.invoiceTemplate` is a `File` → sends as `multipart/form-data`
- Otherwise → sends as `application/json`

#### `deleteOrganization(id)`
`DELETE /organization/deleteOrganization/:id` — Returns `{ ok, message }`.

---

## `UserService` — `services/user.service.ts`

### Types

```ts
interface CreateUserRequest {
  email: string
  password: string
  username: string
  role: 'SUPER_ADMIN' | 'AUDITOR' | 'REGULATOR' | 'COMPANY_MANAGER' | 'COMPANY_USER'
  orgId?: string   // Required for COMPANY_MANAGER and COMPANY_USER
}
```

### Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `listUsers(params?)` | `GET /user/listUsers` | All users, filterable by `orgId`. Sort: `createdAt`, `username`, `email`, `role`, `lastLoginAt` |
| `listEmployees(params?)` | `GET /user/listEmployees` | Company employees only. Sort: `createdAt`, `username`, `email` |
| `getUser(id)` | `GET /user/:id` | Single user by ID |
| `createUser(user)` | `POST /user/createUser` | Create a new user with a specific role |
| `updateUserStatus(id, status, reason?)` | `PUT /user/updateUser/:id` | Enable or disable a user account with optional reason |

---

## `AssignmentService` — `services/assignment.service.ts`

Links auditor users to company organizations. Controls which companies an auditor can review invoices for.

### Types

```ts
interface Assignment {
  id: string
  auditorOrgId: string
  companyOrgId: string
  status: 'ACTIVE' | 'INACTIVE'
  // Populated by backend mapper:
  company?: { id: string; name: string }
  auditor?: { id: string; username: string; email: string }
  assignedBy?: { id: string; username: string }
}

interface CreateAssignmentRequest {
  auditorUserId: string
  companyOrgId: string
}
```

Valid `sortBy` values: `createdAt` | `assignedAt` | `status`

### Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `createAssignment(payload)` | `POST /assignment/createAssignment` | Assign an auditor to a company |
| `listAssignments(params?)` | `GET /assignment/listAssignments` | List all assignments (paginated) |
| `getAssignmentById(id)` | `GET /assignment/:id` | Single assignment detail |
| `updateAssignment(id, payload)` | `PUT /assignment/updateAssignment/:id` | Change status to `ACTIVE` or `INACTIVE` |
| `deleteAssignment(id)` | `DELETE /assignment/deleteAssignment/:id` | Permanently remove an assignment |

---

## `policyService` — `services/policy.service.ts`

CRUD for compliance policy documents. Managed by SUPER_ADMIN / ADMIN roles.

### Types

```ts
interface Policy {
  id: string
  title: string
  content: string
  version: string
  createdByUserId: string
  updatedByUserId: string
  createdAt: string
  updatedAt: string
}
```

### Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAllPolicies(params?)` | `GET /policy` | All policies (paginated) |
| `createPolicy(data)` | `POST /policy` | Create a new policy |
| `updatePolicy(id, data)` | `PATCH /policy/:id` | Partially update a policy |
| `deletePolicy(id)` | `DELETE /policy/:id` | Permanently delete a policy |
