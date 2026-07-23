# API Client

**File:** `lib/api-client.ts`

The single Axios instance used by every service in the app. Never call `axios` directly — always import `apiClient`.

---

## Instance Configuration

```ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',   // Suppresses ngrok browser warning page in dev
  },
  withCredentials: true,  // Sends cookies cross-origin (needed for cookie-based auth fallback)
})
```

---

## Request Interceptor — Token Attachment

Before every outgoing request, the interceptor reads `token` from `localStorage` and attaches it as a `Bearer` token in the `Authorization` header.

```
Request → read localStorage('token') → attach Authorization: Bearer <token> → send
```

If no token exists, the request is sent without an `Authorization` header (for public endpoints).

---

## Response Interceptor — Silent Token Refresh

Handles `401 Unauthorized` responses by attempting a silent token refresh. This means users are never suddenly logged out due to an expired access token.

### Flow

```
API Response 401
  ↓
Is it an auth endpoint? (/auth/login, /auth/refresh, /auth/logout)
  → YES: skip refresh, reject immediately (avoids infinite loop)
  → NO: continue ↓

Is a refresh already in progress?
  → YES: queue this request, wait for refresh to complete, then retry
  → NO: start refresh ↓

GET refreshToken from localStorage
  → Not found: throw, clear session, redirect to /login
  → Found: POST /auth/refresh ↓

Refresh success:
  - Store new accessToken + refreshToken in localStorage
  - Update apiClient default headers
  - Flush the queued requests with the new token
  - Retry the original failed request

Refresh failure:
  - Flush queue with error (all queued requests reject)
  - Clear token, refreshToken, user from localStorage
  - Expire the cookie: token=; expires=Thu, 01 Jan 1970...
  - Redirect to /login (if not already there)
```

### Request Queue

A `failedQueue: QueueItem[]` array holds requests that arrived while a refresh was already in progress. Once the refresh resolves, `processQueue()` either resolves them all (with the new token) or rejects them all (if refresh failed).

```ts
interface QueueItem {
  resolve: (value?: unknown) => void
  reject: (error: unknown) => void
}
```

### Auth Endpoints Excluded from Refresh

```ts
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout']
```

These are never retried with token refresh to avoid infinite loops.

---

## Usage

```ts
import { apiClient } from '@/lib/api-client'

// GET with params
const { data } = await apiClient.get('/invoice/list', { params: { page: 1, limit: 10 } })

// POST JSON
const { data } = await apiClient.post('/auth/login', { email, password })

// POST multipart (delete Content-Type so browser sets boundary)
const { data } = await apiClient.post('/invoice/upload', formData, {
  transformRequest: [(_data, headers) => { delete headers['Content-Type']; return _data }]
})
```
