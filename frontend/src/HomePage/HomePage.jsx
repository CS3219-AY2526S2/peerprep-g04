import Typography from "@mui/material/Typography";
import { useState, useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import styles from './HomePage.module.css';
import { UserContext } from "../hooks/useUserService";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { AccountPage } from "../AccountPage/AccountPage";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import { AiChatPage } from "../AiChat/AiChatPage";

export function HomePage() {
  const { user, logout } = useContext(UserContext)
  const [anchorElem, setAnchorElem] = useState();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to='/' />
  }

   async function myLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography style={{marginRight: 'auto'}}>PeerPrep</Typography>
        <Typography className={styles.navBtn} onClick={ev => navigate('user-management')}>Users</Typography>
        <Typography className={styles.navBtn} onClick={ev => navigate('question-management')}>Questions</Typography>
        <Avatar 
          style={{cursor: 'pointer'}}
          onClick={(ev) => setAnchorElem(ev.currentTarget)}
        >
          {user?.username[0].toUpperCase()}
        </Avatar>
        <Menu
          anchorEl={anchorElem}
          open={Boolean(anchorElem)}
          onClose={() => setAnchorElem(null)}
        >
          <MenuItem onClick={() => navigate('account')}>Account</MenuItem>
          <MenuItem onClick={myLogout} style={{color: 'red'}}>Logout</MenuItem>
        </Menu>
      </div>
       <div className={styles.body}>
        <Button variant='outlined' onClick={() => navigate('/signed-in/match')}>Start</Button>
      </div>
    </div>
  )
}