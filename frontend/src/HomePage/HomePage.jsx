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

const states = Object.freeze({
  home: 0,
  match: 1,
})

export function HomePage() {
  const { user } = useContext(UserContext)
  const [idx, setIdx] = useState(states.home);
  const [anchorElem, setAnchorElem] = useState();
  const navigate = useNavigate();

  function tabsChange(ev, val) {
    setIdx(val);
  }

  function getPage(state) {
    switch (state) {
      case states.account:
        return <AccountPage />
        break;
      
      default:
        return <div>Hello World {idx}</div>
    }
  }

  if (!user) {
    return <Navigate to='/' />
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Typography>PeerPrep</Typography>
        <Tabs 
          value={idx}
          onChange={tabsChange}
        >
          <Tab label='Home' value={states.home} />
          <Tab label='Match' value={states.match} />
        </Tabs>
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
          {user?.access === 'admin' && <MenuItem onClick={() => navigate('question-management')}>Question Management</MenuItem>}
        </Menu>
      </div>
      <div className={styles.body}>
        <Button onClick={() => navigate('/signed-in/match')}>Start</Button>
      </div>
    </div>
  )
}