import { useContext, useState, useEffect } from "react";
import { UserContext } from "../hooks/useUserService.jsx";
import {
  get_all_users,
  external_update_user
} from "../hooks/useUserService.jsx";

import styles from './UserListPage.module.css';

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from "@mui/material/TextField";

import { Table } from "../components/Table";
import { PrimaryButton } from '../components/PrimaryButton';

import { useOutletContext } from "react-router";

export function UserListPage() {
  const { accessToken, setUser: setCurrUser, user: currUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const { reload, setReload } = useOutletContext();

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    access: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    get_all_users(accessToken).then(users => {
      if (users) setUsers(users);
    });
  }, [accessToken, reload]);

  const handleOpen = (user) => {
    setSelectedUser(user);
    setForm({
      username: user.username,
      email: user.email,
      access: user.access,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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

      setReload(r => !r);

      handleClose();
    }

    setLoading(false);
  };

  const hasChanges = () => {
    if (!selectedUser) return false;
  
    return (
      form.username !== selectedUser.username ||
      form.email !== selectedUser.email ||
      form.access !== selectedUser.access
    );
  };

  return (
    <div className={styles.main}>
      <div className={styles.body}>
        
        <h1 className={styles.title}>
          Manage Users
        </h1>

        <Table emptyMessage="No users found." style={{ width: "100%" }}>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>username</th>
                <th>email</th>
                <th>access</th>
                <th>&nbsp;</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.access}</td>
                  <td>
                    <IconButton onClick={() => handleOpen(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle style={{ fontFamily: "'DM Sans', sans-serif" }}>Edit Userg</DialogTitle>

          <DialogContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
              
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />

              <FormControl fullWidth>
                <InputLabel id="access-label">Access</InputLabel>
                <Select
                  labelId="access-label"
                  name="access"
                  value={form.access}
                  label="Access"
                  onChange={handleChange}
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
                onClick={handleClose}
              />

              <PrimaryButton
                text={loading ? "Updating..." : "Update"}
                color="blue"
                fullWidth={true}
                onClick={handleSave}
                disabled={loading || !hasChanges()}
              />

            </div>
          </DialogActions>
        </Dialog>

      </div>
    </div>
  );
}