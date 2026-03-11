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
    isOpen: boolean
    email: string
    onClose: () => void
}

const EmailConfirmationDialog = ({isOpen, email, onClose}: EmailConfirmationDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Check your email</DialogTitle>
                    <DialogDescription>
                        We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>.
                        Click the link in the email to activate your account.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onClose} className="text-white">Got it</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EmailConfirmationDialog
