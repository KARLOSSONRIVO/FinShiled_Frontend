import Link from "next/link"
import { FileKey2, ScrollText } from "lucide-react"

const settings = [
  { href: "/admin/owner/policy", title: "Business policies", description: "Manage platform business policies and organization guidance.", icon: FileKey2 },
  { href: "/admin/owner/terms", title: "Terms and conditions", description: "Manage the business terms presented across FinShield.", icon: ScrollText },
]

export default function BusinessSettingsPage() {
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Business Settings</h2><p className="text-sm text-muted-foreground">Business-facing controls are kept separate from technical platform configuration.</p></div><div className="grid gap-4 md:grid-cols-2">{settings.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Icon className="h-6 w-6 text-emerald-600" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{description}</p></Link>)}</div></div>
}
