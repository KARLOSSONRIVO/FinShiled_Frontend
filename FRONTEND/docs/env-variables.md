# Environment Variables

**File:** `FRONTEND/.env`

> [!CAUTION]
> Never commit real credentials or secrets to `.env`. The `.env` file is listed in `.gitignore`. Use `.env.example` for sharing the variable names with the team.

---

## Variables Reference

### `NEXT_PUBLIC_API_URL`
```
NEXT_PUBLIC_API_URL=https://your-backend.ngrok-free.dev
```
**Required.** Base URL for all API requests. Used by `lib/api-client.ts` as the Axios `baseURL`.

- In development: typically an ngrok tunnel pointing to the local backend
- In production: the deployed backend URL (e.g. `https://api.finshield.com`)

The `ngrok-skip-browser-warning: true` header is set on the Axios instance to suppress the ngrok interstitial page during development.

> [!NOTE]
> Prefixed with `NEXT_PUBLIC_` — this variable is **exposed to the browser bundle**. Do not put secrets here.

---

### `BACKEND_URL`
```
BACKEND_URL=https://your-backend.ngrok-free.dev
```
**Server-side only** (no `NEXT_PUBLIC_` prefix). Used for server-to-server calls (e.g. in Next.js Route Handlers or Server Components if added in future). Not currently used by the frontend bundle directly.

---

### `NEXT_PUBLIC_IPFS_GATEWAY`
```
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```
**Required for invoice viewing.** Base URL for the IPFS gateway. Invoice document files are stored on IPFS; the frontend constructs the full URL as:

```ts
const fileUrl = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${ipfsCid}`
```

The CID comes from `InvoiceDetail.blockchain.ipfsCid`.

Default points to Pinata's public gateway. Can be swapped for any IPFS-compatible gateway.

---

### `NEXT_PUBLIC_BLOCK_EXPLORER_URL`
```
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io/tx/
```
**Optional — future use.** Base URL for blockchain transaction links. Currently set to Sepolia testnet Etherscan. The frontend constructs transaction links as:

```ts
const txUrl = `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}${transactionHash}`
```

Change this to mainnet Etherscan (`https://etherscan.io/tx/`) or another explorer when moving to production.

---

## Setup for New Developers

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values — ask a team member for the current ngrok URL or backend address.
3. Restart the dev server after any `.env` change:
   ```bash
   npm run dev
   ```
