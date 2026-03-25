import { useContext, useState, useEffect } from "react";
import { UserContext } from "../hooks/useUserService.jsx";
import {
  get_all_users,
  external_update_user
} from "../hooks/useUserService.jsx";

import styles from './UserListPage.module.css';

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

import { EditUserDialog } from "./EditUserDialog";

import { Table } from "../components/Table";

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

        <EditUserDialog
          open={open}
          onClose={handleClose}
          form={form}
          onChange={handleChange}
          onSave={handleSave}
          loading={loading}
          hasChanges={hasChanges}
        />

      </div>
    </div>
  );
}