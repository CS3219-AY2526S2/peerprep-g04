import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import { PrimaryButton } from "../components/PrimaryButton";

export function EditUserDialog({
  open,
  onClose,
  form,
  onChange,
  onSave,
  loading,
  hasChanges,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Edit User
      </DialogTitle>

      <DialogContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={form.username}
            onChange={onChange}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={onChange}
          />

          <FormControl fullWidth>
            <InputLabel id="access-label">Access</InputLabel>
            <Select
              labelId="access-label"
              name="access"
              value={form.access}
              label="Access"
              onChange={onChange}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </div>
      </DialogContent>

      <DialogActions style={{ padding: "1rem" }}>
        <div style={{ display: "flex", width: "100%", gap: "0.75rem" }}>
          <PrimaryButton
            text="Cancel"
            color="white"
            fullWidth={true}
            onClick={onClose}
          />

          <PrimaryButton
            text={loading ? "Updating..." : "Update"}
            color="blue"
            fullWidth={true}
            onClick={onSave}
            disabled={loading || !hasChanges()}
          />
        </div>
      </DialogActions>
    </Dialog>
  );
}