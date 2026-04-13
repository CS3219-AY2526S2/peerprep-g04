import { useContext, useState, useEffect } from "react";
import { UserContext } from "../hooks/useUserService.jsx";
import { get_all_users } from "../hooks/useUserService.jsx";

import styles from './UserListPage.module.css';

import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';

import { EditUserDialog } from "./EditUserDialog";
import { Table } from "../components/Table";

import { useOutletContext } from "react-router";
import { DeleteDialog } from "../components/DeleteDialog.jsx";

export function UserListPage() {
  const { accessToken } = useContext(UserContext);
  const { reload, setReload } = useOutletContext();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { user, deleteUser } = useContext(UserContext);

  const [openDel, setOpenDel] = useState(false);
  const [userIdToDel, setUserIdToDel] = useState();

  useEffect(() => {
    get_all_users(accessToken).then((users) => {
      if (users) setUsers(users);
    });
  }, [accessToken, reload]);

  const filteredUsers = users
  .filter((user) => {
    const s = search.toLowerCase();

    const matchesSearch =
      user.username.toLowerCase().includes(s) ||
      user.email.toLowerCase().includes(s);

    const matchesRole =
      roleFilter === "all" || user.access === roleFilter;

    return matchesSearch && matchesRole;
  })
  .sort((a, b) => a.id - b.id); 

  const handleOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    setReload((r) => !r);
  };

  function canUpdate(access) {
    if (access === 'owner') return false;
    if (user.access === 'admin' && access !== 'user') return false;
    return true;
  }

  function canDelete(user_id, access) {
    if (user.user_id === user_id) return false; // self delete is in the account page.
    if (user.access === 'admin' && access !== 'user') return false;
    return true;
  }


  return (
    <div className={styles.main}>
      <div className={styles.body}>
        <h1 className={styles.title}>Manage Users</h1>

        <div className={styles.filters}>
          <TextField
            label="Search"
            placeholder="Search by username or email..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 400, backgroundColor: "#fff", borderRadius: 1 }}
          />

          <TextField
            label="Role"
            select
            size="small"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 150, backgroundColor: "#fff", borderRadius: 1 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>
        </div>

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
              {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.access}</td>
                    <td>
                      {canUpdate(user.access) && (
                        <IconButton onClick={() => handleOpen(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {
                        canDelete(user.id, user.access) && (
                          <IconButton onClick={() => { setUserIdToDel(user.id); setOpenDel(true) }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </Table>

        <EditUserDialog
          open={open}
          onClose={handleClose}
          selectedUser={selectedUser}
          onSuccess={handleSuccess}
        />

        <DeleteDialog 
          open={openDel}
          onClose={() => setOpenDel(false)}
          onConfirm={ 
            async () => { 
              const res = await deleteUser(userIdToDel); 
              if (res) {
                setOpenDel(false);
                setReload(r => !r);
              }
            }
          }
          message='Are you sure you want to delete this user ?'
        />
      </div>
    </div>
  );
}