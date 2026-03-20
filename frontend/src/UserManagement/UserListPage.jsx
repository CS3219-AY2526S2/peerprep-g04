import { useContext, useState, useEffect, useReducer, useRef } from "react";
import { UserContext } from "../hooks/useUserService.jsx";
import { get_all_users } from "../hooks/useUserService.jsx";
import styles from './UserListPage.module.css';
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

function UserRow(props) {
  const { user } = props;
  const { id, username, email, access } = user;
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <tr>
      <td>{id}</td>
      <td>{username}</td>
      <td>{email}</td>
      <td>{access}</td>
      <td>
        <IconButton onClick={ev => setAnchorEl(ev.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={ev => setAnchorEl(null)}
        >
          <MenuItem>Edit</MenuItem>
        </Menu>
      </td>
    </tr>
  )
}

export function UserListPage() {
  const { accessToken } = useContext(UserContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    get_all_users(accessToken).then(users => {
      console.log(users);
      users && setUsers(users)
    });
  }, [accessToken]);

  return (
    <div className={styles.main}>
      <div className={styles.body}>
        <div>
          <Typography variant="h5">Users</Typography>
        </div>
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
            {users.map(user => <UserRow key={user.id} user={user} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}