import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { PrimaryButton } from "../components/PrimaryButton";

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: "'DM Sans', sans-serif" }}>
        {title}
      </DialogTitle>

      <DialogContent sx={{ fontFamily: "'DM Sans', sans-serif" }}>
        {message}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <div style={{ display: "flex", width: "100%", gap: "0.75rem" }}>
          <PrimaryButton
            text="Cancel"
            color="white"
            fullWidth
            onClick={onClose}
          />

          <PrimaryButton
            text={loading ? "Deleting..." : "Delete"}
            color="red"
            fullWidth
            onClick={onConfirm}
            disabled={loading}
          />
        </div>
      </DialogActions>
    </Dialog>
  );
}