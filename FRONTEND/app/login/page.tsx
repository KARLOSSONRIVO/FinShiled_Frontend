"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { usePasswordVisibility } from "@/hooks/auth/use-password-visibility"
import { useAuth } from "@/hooks/global/use-auth"
import { toast } from "sonner"
import { sanitizeInput } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { showPassword, toggle, inputType } = usePasswordVisibility()
  const { login, isLoading, user } = useAuth()
  const { setTheme } = useTheme()

  const [isPending, setIsPending] = useState(false)
  const [loginError, setLoginError] = useState(false)

  // Force light mode
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  // Route forced-password users only to the dedicated credential handoff page.
  useEffect(() => {
    if (!isLoading && user) {
      if (user.mustChangePassword) {
        router.replace('/change-temporary-password')
      } else {
        redirectToDashboard()
      }
    }
  }, [isLoading, user, router])

  const redirectToDashboard = () => {
    if (!user) return

    const roleRoutes: Record<string, string> = {
      SUPER_ADMIN: "/admin/superadmin",
      ADMINISTRATOR: "/admin/admin",
      ADMIN: "/admin/admin",
      AUDITOR: "/admin/external-auditor",
      REGULATOR: "/admin/regulator",
      COMPANY_MANAGER: "/company/manager",
      COMPANY_USER: "/company/employee",
    }
    const destination = user.role ? roleRoutes[user.role] : "/"
    router.replace(destination || "/")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setLoginError(false)
    try {
      await login({ email: sanitizeInput(email), password })
      // AuthProvider routes the restricted response to password change or MFA.
    } catch (error: any) {
      let message = error.response?.data?.message || error.message || "Invalid credentials"
      if (message === "User is not active") {
        message = "Account Disabled; contact management"
      }
      toast.error(`Login failed: ${message}`)
      setLoginError(true)
    } finally {
      setIsPending(false)
    }
  }

  return (
      <div className="h-screen w-full flex overflow-hidden">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center px-8 md:px-16 lg:px-24 xl:px-32 py-8 bg-[#f5f5f0]">
          <div className="w-full max-w-md my-auto flex flex-col justify-center min-h-max">
            <div className="mb-8 flex justify-center shrink-0">
              <Link href="/">
                <Image
                  src="/assets/image/FinShield.svg"
                  alt="FinShield Logo"
                  width={160}
                  height={160}
                  className="h-28 w-auto md:h-32"
                />
              </Link>
            </div>

            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl text-gray-800 mb-3">
                Hello, <span className="font-bold">Welcome Back!</span>
              </h1>
              <p className="text-gray-500 text-base">
                We&apos;re happy to see you again. Let&apos;s stay ahead of the game.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError(false) }}
                  required
                  maxLength={100}
                  className={`!bg-white text-gray-900 placeholder:text-gray-400 h-14 rounded-xl shadow-sm text-base transition-all focus:ring-emerald-500 ${loginError
                    ? "border-2 border-red-500 focus:border-red-500 animate-shake"
                    : "border-gray-300 focus:border-emerald-500"
                    }`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={inputType}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError(false) }}
                    required
                    minLength={8}
                    maxLength={64}
                    className={`!bg-white text-gray-900 placeholder:text-gray-400 h-14 rounded-xl shadow-sm pr-12 text-base transition-all focus:ring-emerald-500 ${loginError
                      ? "border-2 border-red-500 focus:border-red-500 animate-shake"
                      : "border-gray-300 focus:border-emerald-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    suppressHydrationWarning
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                isLoading={isPending}
                loadingText="Logging in..."
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 text-base tracking-wide shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Login
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side - Hero Content */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] flex-col justify-center p-10 xl:p-16">
          <div className="flex-1 flex flex-col">
            <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-tight mb-8">
              <span className="text-emerald-400">Secure</span> your invoices with{" "}
              <span className="text-emerald-400">AI-powered</span>
              <br />
              fraud detection
            </h2>

            <p className="text-gray-400 text-base xl:text-lg leading-relaxed mb-14 max-w-lg">
              FinShield combines{" "}
              <span className="text-emerald-400">advanced AI anomaly detection</span> with{" "}
              <span className="text-emerald-400">blockchain verification</span> to protect your
              organization from <span className="text-emerald-400">invoice fraud</span>.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">AI Fraud Detection</h3>
                  <p className="text-gray-500 text-sm">Identify anomalies and duplicate invoices in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Blockchain Verification</h3>
                  <p className="text-gray-500 text-sm">Tamper-proof invoice records with immutable blockchain ledger</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Real-time Alerts</h3>
                  <p className="text-gray-500 text-sm">Instant notifications for suspicious transactions and anomalies</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <p className="text-gray-600 text-xs tracking-widest uppercase font-medium">
              Trusted by finance companies around the globe
            </p>
          </div>
        </div>
      </div>

  )
}
