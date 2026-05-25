"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MFASettings } from "@/components/settings/MFASettings"
import { AppearanceSettings } from "@/components/settings/AppearanceSettings"
import { User, Shield, Lock, KeyRound, Sliders, Save } from "lucide-react"
import { useAuth } from "@/hooks/global/use-auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "@/components/settings/ChangePasswordDialog"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface AdminSettingsState {
    generalThreshold: number
    mismatchVariance: number
    autoApprovalLimit: number
    flagOnMismatch: boolean
    flagOnMissingIid: boolean
}

const defaultSettings: AdminSettingsState = {
    generalThreshold: 75,
    mismatchVariance: 5,
    autoApprovalLimit: 50000,
    flagOnMismatch: true,
    flagOnMissingIid: true,
}

export default function AdminSettingsPage() {
    const { user } = useAuth()
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("profile")
    
    // AI Settings State
    const [aiSettings, setAiSettings] = useState<AdminSettingsState>(defaultSettings)
    const [isSaving, setIsSaving] = useState(false)

    // Load settings from localStorage on client-side mount
    useEffect(() => {
        const saved = localStorage.getItem("finshield_admin_settings")
        if (saved) {
            try {
                setAiSettings(JSON.parse(saved))
            } catch {
                setAiSettings(defaultSettings)
            }
        }
    }, [])

    const handleSaveSettings = () => {
        setIsSaving(true)
        setTimeout(() => {
            localStorage.setItem("finshield_admin_settings", JSON.stringify(aiSettings))
            setIsSaving(false)
            toast.success("AI threshold settings saved successfully.")
        }, 800)
    }

    const formatRole = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-normal tracking-tight">Settings</h3>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                    Manage your account settings, preferences, and AI thresholds.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
                <div className="flex w-full">
                    <TabsList className="relative bg-muted p-1 rounded-lg inline-flex overflow-x-auto no-scrollbar">
                        {/* Animated Background Indicator */}
                        <div className="absolute inset-0 p-1 pointer-events-none">
                            <motion.div
                                className="h-full bg-background dark:bg-zinc-800 rounded-[5px] shadow-sm border border-black/5 dark:border-white/10"
                                layoutId="settingsTabIndicator"
                                initial={false}
                                animate={{
                                    x: activeTab === 'profile' ? 0 : activeTab === 'ai' ? '33.3%' : '66.6%',
                                    width: '33.3%'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        </div>

                        <TabsTrigger value="profile" className="gap-2 w-32 relative z-10 px-6 py-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="gap-2 w-32 relative z-10 px-6 py-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0">
                            <Sliders className="h-4 w-4" />
                            AI Settings
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="gap-2 w-36 relative z-10 px-6 py-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0">
                            <Shield className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="w-full focus-visible:outline-none focus-visible:ring-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
                    >
                        {/* Profile Information Card */}
                        <div className="p-4 sm:p-6 border rounded-xl bg-card text-card-foreground shadow-sm space-y-6 w-full overflow-hidden">
                            <div>
                                <h4 className="font-semibold text-lg">Profile Information</h4>
                                <p className="text-sm text-muted-foreground">View your account details</p>
                            </div>

                            <div className="grid gap-4 w-full sm:max-w-xl">
                                <div className="grid gap-2">
                                    <Label>Username</Label>
                                    {user?.username ? (
                                        <Input
                                            value={user.username}
                                            readOnly
                                            className="bg-muted cursor-default focus-visible:ring-0 select-none"
                                        />
                                    ) : (
                                        <Skeleton className="h-10 w-full" />
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    {user?.email ? (
                                        <Input
                                            value={user.email}
                                            readOnly
                                            className="bg-muted cursor-default focus-visible:ring-0 select-none"
                                        />
                                    ) : (
                                        <Skeleton className="h-10 w-full" />
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    {user?.role ? (
                                        <Input
                                            value={formatRole(user.role)}
                                            readOnly
                                            className="bg-muted cursor-default focus-visible:ring-0 select-none"
                                        />
                                    ) : (
                                        <Skeleton className="h-10 w-full" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Authentication Card (MFA) */}
                        <MFASettings />

                        {/* Change Password Card */}
                        <div className="p-4 sm:p-6 border rounded-xl bg-card text-card-foreground shadow-sm space-y-6 w-full overflow-hidden">
                            <div>
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                    <KeyRound className="h-5 w-5 text-emerald-500" />
                                    Password Management
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Regularly update your password to keep your account secure.
                                </p>
                            </div>
                            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">Change Password</p>
                                    <p className="text-xs text-muted-foreground">
                                        Update your password to a new one.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setChangePasswordOpen(true)}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    size="sm"
                                >
                                    <Lock className="h-4 w-4" />
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                {/* AI Configuration Settings */}
                <TabsContent value="ai" className="w-full focus-visible:outline-none focus-visible:ring-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-3xl w-full"
                    >
                        <div className="p-4 sm:p-6 border rounded-xl bg-card text-card-foreground shadow-sm space-y-6 w-full">
                            <div>
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                    <Sliders className="h-5 w-5 text-emerald-500" />
                                    AI Fraud Risk Settings
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Configure risk thresholds and automatic detection criteria for incoming invoices.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* General AI Suspicions Threshold */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="generalThreshold" className="font-bold text-sm">AI Suspicions Risk Flag Threshold</Label>
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            {aiSettings.generalThreshold}% Match
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        id="generalThreshold"
                                        min="0"
                                        max="100"
                                        value={aiSettings.generalThreshold}
                                        onChange={(e) => setAiSettings({ ...aiSettings, generalThreshold: Number(e.target.value) })}
                                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Flag invoices whose AI fraud probability score exceeds this percentage limit.
                                    </p>
                                </div>

                                {/* Allowed Mismatch Variance */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="mismatchVariance" className="font-bold text-sm">Amount Mismatch Tolerance Variance</Label>
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                            {aiSettings.mismatchVariance}% Deviation
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        id="mismatchVariance"
                                        min="0"
                                        max="20"
                                        step="0.5"
                                        value={aiSettings.mismatchVariance}
                                        onChange={(e) => setAiSettings({ ...aiSettings, mismatchVariance: Number(e.target.value) })}
                                        className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Discrepancies below this percentage between purchase orders and invoice amounts will be tolerated.
                                    </p>
                                </div>

                                {/* Auto-Approval Limit */}
                                <div className="space-y-2">
                                    <Label htmlFor="autoApprovalLimit" className="font-bold text-sm">Auto-Approval Maximum Limit Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">₱</span>
                                        <Input
                                            type="number"
                                            id="autoApprovalLimit"
                                            value={aiSettings.autoApprovalLimit}
                                            onChange={(e) => setAiSettings({ ...aiSettings, autoApprovalLimit: Number(e.target.value) })}
                                            className="pl-7 h-10 border border-border"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Invoices below this value with "Clean" AI verdicts are auto-approved for payment.
                                    </p>
                                </div>

                                {/* Toggles */}
                                <div className="pt-2 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Auto-Flag on Metadata Mismatch</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Instantly flag any mismatch in supplier names or account numbers.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={aiSettings.flagOnMismatch}
                                            onCheckedChange={(val) => setAiSettings({ ...aiSettings, flagOnMismatch: val })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Auto-Flag on Missing Invoice ID</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Instantly flag any document failing to report a legible, unique Invoice Number.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={aiSettings.flagOnMissingIid}
                                            onCheckedChange={(val) => setAiSettings({ ...aiSettings, flagOnMissingIid: val })}
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4 border-t border-border flex justify-end">
                                    <Button
                                        onClick={handleSaveSettings}
                                        disabled={isSaving}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 h-10 px-6"
                                    >
                                        {isSaving ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Settings
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                <TabsContent value="appearance" className="w-full focus-visible:outline-none focus-visible:ring-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-2xl w-full"
                    >
                        <AppearanceSettings />
                    </motion.div>
                </TabsContent>
            </Tabs>

            <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
        </div >
    )
}
