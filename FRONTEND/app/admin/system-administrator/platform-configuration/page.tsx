"use client"

import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlatformConfiguration } from "@/hooks/system-admin/use-platform-configuration"
import { SystemService } from "@/services/system.service"

export default function PlatformConfigurationPage() {
  const queryClient = useQueryClient()
  const { data, isError, isLoading } = usePlatformConfiguration()
  const [message, setMessage] = useState("")
  const [seconds, setSeconds] = useState(30)
  const [confirmation, setConfirmation] = useState("")
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)
  const [maintenanceConfirmation, setMaintenanceConfirmation] = useState("")

  useEffect(() => {
    if (data) {
      setMessage(data.maintenanceMessage)
      setSeconds(data.statusRefreshSeconds)
    }
  }, [data])

  const enabled = Boolean(data?.maintenanceMode)
  const expectedMaintenanceConfirmation = enabled
    ? "DISABLE MAINTENANCE"
    : "ENABLE MAINTENANCE"
  const maintenanceAction = enabled ? "disable" : "enable"
  const validInterval = Number.isInteger(seconds) && seconds >= 15 && seconds <= 300

  const configurationMutation = useMutation({
    mutationFn: () => SystemService.updateConfiguration({
      maintenanceMessage: message,
      statusRefreshSeconds: seconds,
      confirmation,
    }),
    onSuccess: () => {
      toast.success("Platform configuration saved")
      setConfirmation("")
      queryClient.invalidateQueries({ queryKey: ["platform-configuration"] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Configuration could not be saved")
    },
  })

  const maintenanceMutation = useMutation({
    mutationFn: () => SystemService.setMaintenance({
      enabled: !enabled,
      message: data?.maintenanceMessage,
      confirmation: maintenanceConfirmation,
    }),
    onSuccess: () => {
      toast.success(`Maintenance mode ${enabled ? "disabled" : "enabled"}`)
      setMaintenanceDialogOpen(false)
      setMaintenanceConfirmation("")
      queryClient.invalidateQueries({ queryKey: ["platform-configuration"] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Maintenance mode could not be changed")
    },
  })

  function handleMaintenanceDialogChange(open: boolean) {
    setMaintenanceDialogOpen(open)
    if (!open) setMaintenanceConfirmation("")
  }

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />

  if (isError || !data) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        Platform configuration could not be loaded.
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Manage safe monitoring controls and maintenance mode without exposing sensitive settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <section className="space-y-5 rounded-2xl border bg-card p-6" aria-labelledby="monitoring-settings-title">
          <div>
            <h3 id="monitoring-settings-title" className="text-lg font-semibold">Monitoring settings</h3>
            <p className="text-sm text-muted-foreground">
              Set the maintenance notice and how often System Status checks service health.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance message</Label>
            <Input
              id="maintenance-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-refresh">Status refresh interval (seconds)</Label>
            <Input
              id="status-refresh"
              type="number"
              min={15}
              max={300}
              aria-describedby="status-refresh-help"
              value={seconds}
              onChange={(event) => setSeconds(Number(event.target.value))}
            />
            <p id="status-refresh-help" className="text-xs text-muted-foreground">
              System Status will refresh every {validInterval ? seconds : 30} seconds. Allowed range: 15–300 seconds.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="configuration-confirmation">Type UPDATE PLATFORM CONFIGURATION</Label>
            <Input
              id="configuration-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>

          <Button
            disabled={
              confirmation !== "UPDATE PLATFORM CONFIGURATION"
              || message.trim().length < 5
              || !validInterval
              || configurationMutation.isPending
            }
            onClick={() => configurationMutation.mutate()}
          >
            Save changes
          </Button>
        </section>

        <section
          className={`rounded-2xl border p-6 ${enabled ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50/60"}`}
          aria-labelledby="maintenance-mode-title"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current state</p>
          <h3 id="maintenance-mode-title" className="mt-2 text-2xl font-black">
            {enabled ? "Maintenance active" : "Normal operation"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{data.maintenanceMessage}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            {enabled
              ? "Business API operations are blocked. Authentication and technical administration remain available."
              : "Business API operations are available."}
          </p>
          <Button
            className="mt-6 w-full sm:w-auto"
            variant={enabled ? "default" : "destructive"}
            onClick={() => setMaintenanceDialogOpen(true)}
          >
            {enabled ? "Disable maintenance" : "Enable maintenance"}
          </Button>
        </section>
      </div>

      <Dialog open={maintenanceDialogOpen} onOpenChange={handleMaintenanceDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{enabled ? "Disable maintenance mode" : "Enable maintenance mode"}</DialogTitle>
            <DialogDescription>
              {enabled
                ? "Business API operations will resume immediately."
                : "Business API operations will be blocked while authentication and technical administration remain available."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="maintenance-confirmation">
              Type {expectedMaintenanceConfirmation} to continue
            </Label>
            <Input
              id="maintenance-confirmation"
              autoComplete="off"
              value={maintenanceConfirmation}
              onChange={(event) => setMaintenanceConfirmation(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleMaintenanceDialogChange(false)}>
              Cancel
            </Button>
            <Button
              aria-label={`Confirm ${maintenanceAction} maintenance`}
              variant={enabled ? "default" : "destructive"}
              disabled={
                maintenanceConfirmation !== expectedMaintenanceConfirmation
                || maintenanceMutation.isPending
              }
              onClick={() => maintenanceMutation.mutate()}
            >
              {enabled ? "Disable maintenance" : "Enable maintenance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
