# Middleware — Route Protection

**File:** `middleware.ts`

Next.js Edge Middleware that runs on every request before it reaches a page or API route. Enforces authentication by checking for a `token` cookie.

---

## How It Works

```
Incoming Request
     ↓
Is the path public? (/login, /forgot-password, /auth/change-password, /)
     │
     ├── YES + has token → NextResponse.next()  (let authenticated users access public pages)
     ├── YES + no token  → NextResponse.next()  (let unauthenticated users access public pages)
     └── NO  + no token  → Redirect to /login   (protect all other routes)
```

## Public Paths

```ts
const publicPaths = ['/login', '/forgot-password', '/auth/change-password', '/']
```

A path is considered public if it exactly matches one of these, **or** if it starts with `/public`.

## Matcher Config

```ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)']
}
```

The middleware is skipped for:
- `/api/*` routes
- `/_next/static/*` and `/_next/image/*` (Next.js internals)
- `favicon.ico`
- `/assets/*` (static file folder)

---

## Important Notes

> [!NOTE]
> The middleware only checks for the **presence** of a `token` cookie — it does **not** validate or decode the JWT. The actual token validation happens in `AuthProvider` via `AuthService.getMe()` on the client side.

> [!NOTE]
> Role-based access control (which role can access which route) is **not** enforced in middleware. Role routing is handled entirely client-side in `navigateBasedOnRole()` inside `AuthProvider`. The middleware only distinguishes between authenticated and unauthenticated.

> [!TIP]
> If you need to decode the JWT in middleware for role-based redirects, install `jose` and use `jwtVerify()` — it runs in the Edge runtime unlike `jsonwebtoken`.
