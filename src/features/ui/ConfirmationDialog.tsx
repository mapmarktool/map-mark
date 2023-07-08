import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { useState } from "react"

interface ConfirmationDialogProps {
  title?: string
  open: boolean
  confirmLabel?: string
  cancelLabel?: string
  content: string
  onConfirm?: () => void
  onCancel?: () => void
}

const ConfirmationDialog = ({
  title,
  open,
  content,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (onCancel) {
              onCancel()
            }
          }}
        >
          {cancelLabel ?? "Cancel"}
        </Button>
        <Button
          onClick={() => {
            if (onConfirm) {
              onConfirm()
            }
          }}
        >
          {confirmLabel ?? "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
