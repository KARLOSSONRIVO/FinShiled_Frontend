# Correct Blockchain Network and Owner Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the configured Polygon Amoy network accurately and remove Owner access to Blockchain Transactions at both backend and frontend boundaries.

**Architecture:** The backend remains the authorization authority. Move `blockchain_transactions.view` from Owner to System Administrator while preserving existing scoped Auditor and Regulator read-only access, and return `Polygon Amoy` from the transaction mapper. Make the System Administrator route own the technical transaction page, remove the Owner route and its navigation/dashboard entry, and retain the existing blockchain integration.

**Tech Stack:** Express, Node.js test runner, Next.js 16, React 19, TypeScript, Vitest

## Global Constraints

- Do not expose the blockchain RPC URL or credentials.
- Do not change invoice anchoring, IPFS, or Web3 transaction behavior.
- Owner must not receive Blockchain Transactions data through direct API requests.
- System Administrator retains technical transaction details.
- Auditor and Regulator retain existing scoped read-only compliance access.

---

### Task 1: Correct backend network metadata and authorization

**Files:**
- Create: `FinShield/BACKEND/tests/blockchainAccess.test.js`
- Modify: `FinShield/BACKEND/src/modules/mappers/invoice.mapper.js`
- Modify: `FinShield/BACKEND/src/common/utils/role_helpers.js`
- Modify: `FinShield/BACKEND/src/routes/blockchain/blockchain.route.js`
- Modify: `FinShield/BACKEND/src/modules/services/blockchain/getTransactions.js`

**Interfaces:**
- Consumes: `toBlockchainTransaction`, `hasPermission`, `PERMISSION.BLOCKCHAIN_TRANSACTIONS_VIEW`
- Produces: `network: "Polygon Amoy"` and an Owner-denying transaction permission

- [x] **Step 1: Write failing backend tests**

Add assertions that a mapped transaction reports `Polygon Amoy`, Owner lacks `blockchain_transactions.view`, and System Administrator, Auditor, and Regulator retain the intended permission.

- [x] **Step 2: Run the backend test and confirm expected failures**

Run: `node --test tests/blockchainAccess.test.js`

Expected: FAIL because the mapper returns `Ethereum` and Owner currently owns the permission.

- [x] **Step 3: Implement the backend correction**

Set the mapper network field to `Polygon Amoy`; remove the permission from Owner; grant it to System Administrator, Auditor, and Regulator; protect the route with `allowPermissions(PERMISSION.BLOCKCHAIN_TRANSACTIONS_VIEW)`; and make all-status technical queries System Administrator-only.

- [x] **Step 4: Run the focused backend test**

Run: `node --test tests/blockchainAccess.test.js`

Expected: PASS.

### Task 2: Remove Owner frontend access and make System Administrator own the page

**Files:**
- Create: `FinShiled_Frontend/FRONTEND/app/admin/owner/layout.test.tsx`
- Create: `FinShiled_Frontend/FRONTEND/app/admin/owner/page.test.tsx`
- Modify: `FinShiled_Frontend/FRONTEND/app/admin/owner/layout.tsx`
- Modify: `FinShiled_Frontend/FRONTEND/app/admin/owner/page.tsx`
- Modify: `FinShiled_Frontend/FRONTEND/app/admin/owner/blockchain/page.tsx`
- Modify: `FinShiled_Frontend/FRONTEND/app/admin/system-administrator/blockchain/page.tsx`

**Interfaces:**
- Consumes: `AppSidebar`, `StatsCard`, `useBlockchain`
- Produces: no Owner Blockchain Transactions link/card/route and a working System Administrator technical page

- [x] **Step 1: Write failing frontend tests**

Render the real Owner sidebar and dashboard. Assert neither exposes a Blockchain Transactions link or card.

- [x] **Step 2: Run the focused frontend tests and confirm expected failures**

Run: `npm test -- app/admin/owner/layout.test.tsx app/admin/owner/page.test.tsx`

Expected: FAIL because Owner currently exposes the sidebar link and dashboard card.

- [x] **Step 3: Implement the frontend correction**

Remove the Owner navigation item, title branch, and dashboard card/count usage. Redirect the retired Owner route to Unauthorized and make the System Administrator route use the shared technical transaction page implementation.

- [x] **Step 4: Run focused frontend tests**

Run: `npm test -- app/admin/owner/layout.test.tsx app/admin/owner/page.test.tsx`

Expected: PASS.

### Task 3: Documentation and full verification

**Files:**
- Modify: `FinShield/BACKEND/src/docs/OWNER_SYSTEM_ADMIN_RBAC.md`
- Modify: `FinShield/BACKEND/src/docs/API_USAGE_GUIDE.md`
- Modify: `graphify-out/obsidian/FinShield Owner and System Administrator RBAC.md`

**Interfaces:**
- Consumes: implemented authorization and network behavior
- Produces: matching RBAC/network documentation and verification record

- [x] **Step 1: Update documentation**

Document Polygon Amoy as the configured network, Owner denial, System Administrator technical access, and preserved Auditor/Regulator scoped read-only access.

- [x] **Step 2: Run all verification**

Run backend `npm test`, frontend `npm test`, frontend `npm run build`, and `git diff --check` in both repositories.

Expected: all commands exit successfully.
