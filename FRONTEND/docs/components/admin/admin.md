# Admin Components

**Directory:** `components/organizations/` · `components/users/` · `components/assignments/`

Organization management, user administration, and auditor assignment UI.

---

## Organization Components — `components/organizations/`

### Organization List Table
Paginated table of all organizations. Columns: Name, Type, Status, Created At, Actions.

Calls `OrganizationService.listOrganizations()` via the relevant hook.

**Actions per row:**
- View details
- Edit (opens edit form dialog)
- Delete (with confirmation dialog)

### Create / Edit Organization Dialog
Form with:
- **Name** (text input)
- **Type** select: `company` | `organization`
- **Invoice Template** file upload (optional — PDF/image)

On submit, calls `OrganizationService.createOrganization()` or `OrganizationService.updateOrganization()`.

> [!NOTE]
> The `updateOrganization` call automatically uses `multipart/form-data` when a new template file is provided, and `application/json` otherwise — this is handled in the service layer, not the component.

---

## User Components — `components/users/`

### User List Table
Paginated table of users. Columns: Username, Email, Role, Status, Organization, Last Login, Actions.

Supports filtering by role and organization (`orgId`).

### Create User Dialog
Form with:
- Email, username, password inputs
- Role select (with role-appropriate options depending on the admin's own role)
- Organization select (required for `COMPANY_MANAGER` and `COMPANY_USER`)

Calls `UserService.createUser()`.

### User Status Toggle
Inline button to enable/disable a user account. Opens a confirmation dialog that optionally accepts a `reason` string.

Calls `UserService.updateUserStatus(id, 'active' | 'disabled', reason?)`.

---

## Assignment Components — `components/assignments/`

### Assignment List Table
Shows all auditor-to-company assignments. Columns: Auditor, Company, Status, Assigned By, Created At, Actions.

Calls `AssignmentService.listAssignments()` via hook.

**Actions per row:**
- Toggle status (ACTIVE ↔ INACTIVE) via `AssignmentService.updateAssignment()`
- Delete via `AssignmentService.deleteAssignment()`

### Create Assignment Dialog
Form with:
- **Auditor** select (lists auditor-role users from `UserService.listUsers()`)
- **Company** select (lists company-type orgs from `OrganizationService.listOrganizations()`)

Calls `AssignmentService.createAssignment({ auditorUserId, companyOrgId })`.

> [!NOTE]
> `auditorUserId` is the user's ID, while the assignment stores `auditorOrgId` — the backend resolves the user's org from the user ID automatically.
