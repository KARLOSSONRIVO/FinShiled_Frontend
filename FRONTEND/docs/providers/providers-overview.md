# Providers — Documentation

React context providers wrap the entire application (or large subtrees) and expose
shared state and functionality via React Context + custom hooks.

## Provider Tree

The full provider nesting order (outermost → innermost):

```
<ThemeProvider>           ← next-themes, dark/light mode
  <SmoothScrolling>       ← Lenis smooth scroll
    <QueryProvider>       ← TanStack Query client + persistence
      <AuthProvider>      ← User session, login, logout, MFA
        <SocketProvider>  ← Socket.IO real-time events
          <MetaMaskProvider> ← Web3 wallet connection
            {children}
          </MetaMaskProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryProvider>
  </SmoothScrolling>
</ThemeProvider>
```

## Providers Index

| File | Hook | Description |
|------|------|-------------|
| [auth-provider.md](./auth-provider.md) | `useAuthContext()` | User session, login, logout, MFA, role routing |
| [query-provider.md](./query-provider.md) | — | TanStack Query config & local storage persistence |
| [socket-provider.md](./socket-provider.md) | `useSocket()` | Socket.IO connection and real-time events |
| [metamask-provider.md](./metamask-provider.md) | `useMetaMask()` | MetaMask wallet state and Web3 connection |
| [theme-provider.md](./theme-provider.md) | `useTheme()` | Dark/light theme toggling via next-themes |
| [smooth-scrolling.md](./smooth-scrolling.md) | — | Lenis smooth scroll initialization |
