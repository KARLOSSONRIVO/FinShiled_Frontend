# Components — Documentation

UI components are organized by **feature domain**, not by component type.
All components consume hooks for data — components themselves contain **zero direct API calls**.

## Rules

- Components receive data and callbacks via props or from hooks.
- `components/ui/` is **ShadCN auto-generated** — do not document or edit these directly.
- Loading states use skeleton components from `components/skeletons/`.
- All forms use `react-hook-form` + `zod` validation.

## Components Index

| Folder | Description |
|--------|-------------|
| [layout.md](./layout.md) | TopBar, Sidebar, page wrappers |
| [dashboard.md](./dashboard.md) | Dashboard stat cards, charts, recent activity |
| [invoices.md](./invoices.md) | Invoice list, filters, detail modals, review dialogs |
| [auth.md](./auth.md) | Login form, MFA input, password change dialog |
| [settings.md](./settings.md) | Appearance, profile, security settings panels |
| [organizations.md](./organizations.md) | Org list, create/edit org forms |
| [users.md](./users.md) | User list, create/edit user forms |
| [assignments.md](./assignments.md) | Auditor-company assignment management |
| [blockchain.md](./blockchain.md) | Blockchain verification, MetaMask integration UI |
| [alerts.md](./alerts.md) | Alert/notification components |
| [reports.md](./reports.md) | Report generation and export UI |
| [policy.md](./policy.md) | Policy management UI |
| [audit-logs.md](./audit-logs.md) | Audit log viewer |
| [global.md](./global.md) | Global dialogs (password change, etc.) |
| [skeletons.md](./skeletons.md) | Loading skeleton components |
| [terms.md](./terms.md) | Terms and conditions UI |
