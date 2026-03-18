"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"

interface EmailConfirmationDialogProps {
    email: string
    isOpen: boolean
    onClose: () => void
}

const EmailConfirmationDialog = ({email, isOpen, onClose}: EmailConfirmationDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Check your email</DialogTitle>
                    <DialogDescription>
                        We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Please verify your email to complete the registration.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button className="text-white" onClick={onClose}>Got it</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EmailConfirmationDialog
