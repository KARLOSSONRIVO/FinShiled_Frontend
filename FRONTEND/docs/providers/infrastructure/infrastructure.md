# Infrastructure Providers

Real-time communication, Web3 wallet, UI theme, and scroll behavior.

---

## `SocketProvider` — `providers/socket-provider.tsx`

Manages a single, global Socket.IO connection for the entire app. Exposes the socket via context so any component can subscribe to real-time events.

### How to Use

```ts
import { useContext } from 'react'
import { SocketContext } from '@/providers/socket-provider'

const { on, off, socket } = useContext(SocketContext)!

useEffect(() => {
  const unsubscribe = on(SocketEvents.INVOICE_FLAGGED, (data) => {
    // handle event
  })
  return unsubscribe  // automatically calls off() on cleanup
}, [on])
```

### Context API

```ts
type SocketContextType = {
  socket: React.RefObject<Socket | null>   // Raw socket ref (rarely needed directly)
  on<T>(event: SocketEvent | string, handler: (data: T) => void): () => void
  off(event: SocketEvent | string, handler?: Function): void
}
```

### Connection Lifecycle

The provider reads the auth token from `localStorage` reactively — when `user` from `useAuth()` changes:
- `user` becomes non-null (login) → token is read from `localStorage` → socket connects
- `user` becomes null (logout) → token is `null` → socket disconnects automatically

This ensures the socket is never connected for unauthenticated users.

The underlying logic lives in `hooks/global/use-socket.ts`.

### Event Names

Always use the `SocketEvents` constants from `lib/socket-events.ts` rather than raw strings. See [socket events docs](../../lib/utilities/utilities.md#libsocket-eventsts).

---

## `MetaMaskProvider` — `providers/MetaMaskProvider.tsx`

Wraps `useMetaMask()` hook from `hooks/blockchain/use-metamask` in a context, making the MetaMask wallet state available globally.

### How to Use

```ts
import { useMetaMaskContext } from '@/providers/MetaMaskProvider'

const { isConnected, account, connect, signMessage } = useMetaMaskContext()
```

Throws if called outside `<MetaMaskProvider>`.

The context type is inferred directly from `useMetaMask()` — see `hooks/blockchain/use-metamask.ts` for the full return shape.

---

## `ThemeProvider` — `providers/ThemeProvider.tsx`

Thin wrapper around `next-themes` `ThemeProvider`. Enables system-aware dark/light mode.

### How to Use

```ts
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
setTheme('dark')   // or 'light' or 'system'
```

The `AppearanceSettings` component (`components/settings/`) provides the user-facing toggle.

---

## `SmoothScrolling` — `providers/SmoothScrolling.tsx`

Initializes [Lenis](https://github.com/darkroomengineering/lenis) smooth scrolling for the whole page. Wraps children with a Lenis instance that overrides native browser scroll behavior.

No context is exposed — this is a pure side-effect wrapper. It is placed high in the provider tree so all pages get smooth scrolling automatically.
