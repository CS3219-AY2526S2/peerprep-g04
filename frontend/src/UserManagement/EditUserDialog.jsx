import { useState, useEffect, useContext } from "react";

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

import { UserContext } from "../hooks/useUserService.jsx";
import { external_update_user } from "../hooks/useUserService.jsx";

export function EditUserDialog({
  open,
  onClose,
  selectedUser,
  onSuccess,
}) {
  const { accessToken, user: currUser, setUser: setCurrUser } = useContext(UserContext);

  const [form, setForm] = useState({
    username: "",
    email: "",
    access: "",
  });

  const [loading, setLoading] = useState(false);

  const isOwnerUser = selectedUser?.access === "owner";

  useEffect(() => {
    if (selectedUser) {
      setForm({
        username: selectedUser.username,
        email: selectedUser.email,
        access: selectedUser.access,
      });
    }
  }, [selectedUser]);

  const canEditUserRole = () => {
    if (!currUser || !selectedUser) return false;

    if (currUser.access === "owner") return true;

    if (currUser.access === "admin") {
      return selectedUser.access !== "admin";
    }

    return false;
  };

  const hasChanges = () => {
    if (!selectedUser) return false;

    return (
      form.username !== selectedUser.username ||
      form.email !== selectedUser.email ||
      form.access !== selectedUser.access
    );
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    setLoading(true);

    const res = await external_update_user(
      selectedUser.id,
      form,
      accessToken
    );

    if (res) {
      if (currUser?.user_id === selectedUser.id) {
        setCurrUser({
          ...form,
          user_id: selectedUser.id,
        });
      }

      onSuccess?.();
      onClose();
    }

    setLoading(false);
  };

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
            onChange={handleChange}
            disabled={isOwnerUser}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={isOwnerUser}
          />

          {isOwnerUser ? (
            <TextField
              fullWidth
              label="Access"
              value={selectedUser.access}
              disabled
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel id="access-label">Access</InputLabel>
              <Select
                labelId="access-label"
                name="access"
                value={form.access}
                label="Access"
                onChange={handleChange}
                disabled={!canEditUserRole()}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          )}
        </div>
      </DialogContent>

      <DialogActions style={{ padding: "1rem" }}>
        <div style={{ display: "flex", width: "100%", gap: "0.75rem" }}>
          <PrimaryButton
            text="Cancel"
            color="white"
            fullWidth
            onClick={onClose}
          />

          <PrimaryButton
            text={loading ? "Updating..." : "Update"}
            color="blue"
            fullWidth
            onClick={handleSave}
            disabled={loading || !hasChanges()}
          />
        </div>
      </DialogActions>
    </Dialog>
  );
}