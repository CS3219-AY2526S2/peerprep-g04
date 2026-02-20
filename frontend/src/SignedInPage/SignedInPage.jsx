import Typography from "@mui/material/Typography";
import { useState, useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import styles from './SignedInPage.module.css';
import { UserContext } from "../hooks/useUserService";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { AccountPage } from "../AccountPage/AccountPage";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

const states = Object.freeze({
  home: 0,
  match: 1,
})

export function SignedInPage() {
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
    return <Navigate to='/not-signed-in' />
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
          <MenuItem onClick={() => navigate('../account')}>Account</MenuItem>
          <MenuItem>Questions Management</MenuItem>
        </Menu>
      </div>
      {getPage(idx)}
    </div>
  )
}