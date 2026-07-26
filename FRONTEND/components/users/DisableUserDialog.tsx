"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface DisableUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (reason: string | undefined, confirmation: string) => void
    title?: string
    description?: string
    confirmText?: string
    confirmVariant?: "default" | "destructive"
    confirmationText: string
}

export function DisableUserDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Disable User Access?",
    description = "Are you sure you want to disable this user account? They will no longer be able to access the platform until re-enabled.",
    confirmText = "Disable User",
    confirmVariant = "destructive",
    confirmationText,
}: DisableUserDialogProps) {
    const [reason, setReason] = useState("")
    const [confirmation, setConfirmation] = useState("")

    const handleConfirm = () => {
        onConfirm(reason, confirmation)
        setReason("") // Reset after confirm
        setConfirmation("")
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="border-b pb-4">
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {confirmVariant === "destructive" && (
                    <div className="py-2">
                        <label className="text-sm font-medium mb-2 block text-foreground">Reason for disabling:</label>
                        <Textarea
                            placeholder="Please provide a reason..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                )}
                <div className="py-2"><label className="mb-2 block text-sm font-medium">Type {confirmationText} to confirm</label><Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={confirmVariant === "destructive" ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                        disabled={(confirmVariant === "destructive" && reason.trim().length < 2) || confirmation.trim().toLowerCase() !== confirmationText.toLowerCase()}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
